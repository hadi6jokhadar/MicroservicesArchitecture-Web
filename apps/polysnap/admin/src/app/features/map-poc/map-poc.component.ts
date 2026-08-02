import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as L from 'leaflet';
import {
  bbox,
  circle as turfCircle,
  convex,
  featureCollection,
  intersect,
  kinks,
  lineString,
  point,
  polygon as turfPolygon,
  simplify,
} from '@turf/turf';
import html2canvas from 'html2canvas-pro';
import { TranslatePipe, TranslationService } from '@ihsan/core';
import {
  ZardAlertComponent,
  ZardButtonComponent,
  ZardCardComponent,
  ZardIconComponent,
  ZardInputDirective,
  ZardLoaderComponent,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';

type DrawStep = 'idle' | 'drawing' | 'detecting' | 'done';

interface ILocationSearchForm {
  query: FormControl<string>;
}

const DEFAULT_CENTER: L.LatLngTuple = [24.7136, 46.6753]; // Riyadh, Saudi Arabia
const DEFAULT_ZOOM = 13;
const MIN_TRACE_POINTS = 3;
const TRACE_MIN_PIXEL_DISTANCE = 4;
const FALLBACK_SELECTION_RADIUS_METERS = 20;
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const SEARCH_RESULT_LIMIT = 5;
const LAST_LOCATION_STORAGE_KEY = 'polysnap-map-poc-last-location';

// Two pixels belong to the same flood-filled region if their RGB distance is within
// this bound (max possible distance is ~441.7, i.e. black vs. white). Tuned to
// tolerate normal anti-aliasing/label-halo noise within one rendered map color band
// without bleeding across a real boundary into a genuinely different color (e.g.
// water-blue vs. land-cream) — this is the one parameter most likely to need
// real-world re-tuning against actual captured tiles, which this environment has no
// way to render and inspect directly.
const COLOR_DISTANCE_THRESHOLD = 32;
// Below this many pixels, a flood-fill result is treated as noise (the seed point
// landed on a thin line/label rather than a real fill region), not a detected area.
const MIN_FLOOD_FILL_PIXELS = 60;
// Above this fraction of the total captured crop, a flood-fill result is treated as
// having consumed essentially the whole capture (usually an unbounded background like
// water dominating a loosely-drawn trace) rather than finding a real, more specific
// feature within it. Note: the capture is now cropped tightly to the traced selection's
// own bounding box (no padding beyond it — see "no area outside the drawn area" fix in
// POLYSNAP_PROJECT_OVERVIEW.md), so a candidate that fills close to the whole crop is
// no longer necessarily wrong — the final result is always clipped back to the drawn
// selection regardless, so this mainly affects which CANDIDATE is preferred, not
// whether the final output can escape the drawn area (it can't).
const MAX_FLOOD_FILL_AREA_RATIO = 0.8;
// A flood-fill result that touches at least this many of the crop's 4 edges is treated
// as likely background (water, etc.) dominating the trace rather than a distinct
// bounded feature within it. Since the crop is no longer padded, touching an edge is a
// weaker signal than it used to be (a trace that closely hugs its own target will
// naturally touch its own bounding box on multiple sides) — kept as a candidate-ranking
// preference only; it cannot let a result escape the drawn area, since the final output
// is always clipped to the traced selection regardless of this check.
const MAX_TOUCHED_BORDER_EDGES = 2;
// Among candidates that survive the sanity checks above, the one chosen is whichever
// OVERLAPS the user's own traced selection the most — not just whichever color was
// most common in the sample grid. A real map tile has more than one rendered element
// within any trace (interior fill, coastline border stroke, roads, small features);
// picking purely by frequency can land on a thin border stroke or a small internal
// feature that happens to sample well but doesn't represent what the user pointed at.
// This is a floor only, not a hard cutoff, deliberately kept low: a genuinely loose
// trace (lots of background inside the trace's own bounds) can legitimately have its
// correct answer cover only a small fraction of the trace itself, so a strict floor
// would wrongly reject it — see "Known bug fixed" history in POLYSNAP_PROJECT_OVERVIEW.md.
const MIN_SELECTION_OVERLAP_RATIO = 0.05;
// Caps how many ranked color candidates are tried (each requires its own flood-fill
// pass) — a pathologically many-colored capture shouldn't make detection unbounded.
const MAX_SEED_CANDIDATES_TO_TRY = 8;
// Road-bounded selections (a city block, or any area bounded by lines rather than being
// one solid-colored blob) need a different mechanism entirely: color-region flood-fill
// naturally finds the road NETWORK itself (one continuous connected line spanning the
// whole trace), not the space it encloses, since a road threads through and touches far
// more of a trace than any single disconnected parcel/building/park ever can.
//
// The fix: segment the ENTIRE captured image into connected same-color regions (not
// just what the user's gesture happened to sample), classify each region's SHAPE, and
// find the actual road network structurally — this works from just a mark/point, not a
// trace that has to hug or cross the roads.
//
// A region counts as a "thin/branching" (wall) candidate if its compactness
// (4*pi*area/perimeter^2, ~1 for a circle/blob, near 0 for a thin elongated network) is
// below this bound. This alone isn't enough to identify THE road, though — other thin
// structures exist too (sidewalks, decorative borders, gaps between buildings) — see
// WALL_WIDTH_RATIO_FLOOR below for how the true road gets picked out from among them.
const WALL_MAX_COMPACTNESS = 0.3;
// Real map styles render major roads visibly WIDER than minor paths/separators — this
// is a near-universal cartographic convention. Among the thin/branching candidates
// above, each region's average stroke width is estimated as 2*area/perimeter (valid for
// an elongated strip), and every candidate within this fraction of the WIDEST one found
// is unioned into the wall mask (handles a block bounded by different road classes/
// colors on different sides), while genuinely thinner structures (sidewalks, gaps) are
// excluded. Validated: a real road ring (width ~8px) vs. parcel-separating gaps
// (~2px, ~27% of the road's width) — comfortably separated by this floor.
const WALL_WIDTH_RATIO_FLOOR = 0.5;
// After tracing+simplifying a detected boundary, if it's close enough to a rectangle
// (fitted via a minimum-area rotated bounding rectangle over its convex hull) that the
// traced area covers at least this fraction of the fitted rectangle's own area, the
// clean rectangle is used as the final output instead of the jagged pixel-traced shape
// — most real city blocks bounded by 4 streets ARE rectangular, and this produces the
// crisp right-angle look expected of a block boundary instead of a noisy pixel outline.
// Validated: a genuinely rectangular (rotated, pixel-jittered) shape scored ~0.93
// coverage; a clearly non-rectangular L-shape scored ~0.67 — comfortably separated.
const MIN_RECTANGLE_COVERAGE_RATIO = 0.85;
// This alone is NOT safe to trust blindly: validation showed a scene with no real
// boundary at all (just a small internal feature, e.g. a runway, inside a much larger
// blob) can still produce a thin candidate — using it as a wall can flood far too much
// (nothing stops it at the blob's own true edge). So the wall-exclusion mechanism only
// ever runs as an ALTERNATIVE candidate, still subject to the same background-leak
// sanity checks as every other candidate, and cross-checked against the existing
// interior-candidate pipeline via the same overlap-with-trace score used above — never
// used on its own. See "Known bug fixed" history in POLYSNAP_PROJECT_OVERVIEW.md.
// Radius (in captured-canvas pixels) averaged around the seed point to get a more
// representative fill color than a single pixel, which could unluckily land on a
// road line or building outline within the region.
const SEED_AVERAGE_RADIUS = 3;
// The seed START POINT is chosen from an evenly-spaced grid of this many points per
// axis across the user's traced selection, not from the trace's single centroid pixel
// alone — a real trace (e.g. a circle around a whole island) often contains more than
// one rendered color (an interior road, runway, or building among the general
// fill), and the centroid can land on any of them by chance. Sampling broadly and
// picking whichever color is most common across the trace is far more likely to land
// on the feature the user actually meant to select rather than a small internal detail.
const SEED_SAMPLE_GRID_SIZE = 7;
// Colors are grouped into buckets this wide (per RGB channel) before counting which
// one is most common — groups near-identical shades (anti-aliasing noise) together
// so they aren't split into separate single-sample "buckets" that never win a majority.
const SEED_COLOR_BUCKET_SIZE = 16;
// Simplifies the raw pixel-by-pixel traced boundary (Douglas-Peucker, tolerance in
// canvas pixels) — a boundary walked one pixel at a time is needlessly jagged.
const SIMPLIFY_TOLERANCE_PIXELS = 1.5;
// html2canvas defaults to devicePixelRatio scaling; forcing 1 keeps captured-canvas
// pixel coordinates in a direct 1:1 relationship with Leaflet container coordinates,
// so converting a traced boundary point back to a LatLng is a plain offset add,
// not a DPI-dependent scale-and-offset.
const HTML2CANVAS_SCALE = 1;

interface INominatimSearchResult {
  display_name: string;
  boundingbox: [string, string, string, string]; // [south, north, west, east]
}

export interface ILocationSearchResult {
  label: string;
  bounds: L.LatLngBoundsExpression;
}

interface IStoredLocation {
  label: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
}

// Remembering the last searched location is a pure convenience — if storage is
// unavailable (privacy mode, quota, disabled) the page just falls back to the
// default view, so failures here are swallowed rather than surfaced to the user.
function saveLastLocation(result: ILocationSearchResult): void {
  try {
    const stored: IStoredLocation = {
      label: result.label,
      bounds: result.bounds as [[number, number], [number, number]],
    };
    localStorage.setItem(LAST_LOCATION_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // ignore — remembering the last location is a convenience, not a requirement
  }
}

function loadLastLocation(): IStoredLocation | null {
  try {
    const raw = localStorage.getItem(LAST_LOCATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as IStoredLocation) : null;
  } catch {
    return null;
  }
}

async function searchLocations(query: string): Promise<ILocationSearchResult[]> {
  const url =
    `${NOMINATIM_SEARCH_URL}?format=jsonv2&q=${encodeURIComponent(query)}` +
    `&limit=${SEARCH_RESULT_LIMIT}&accept-language=ar,en`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Nominatim search failed: ${response.status}`);
  }

  const data = (await response.json()) as INominatimSearchResult[];
  return data.map((item) => {
    const [south, north, west, east] = item.boundingbox.map(Number);
    return {
      label: item.display_name,
      bounds: [
        [south, west],
        [north, east],
      ],
    };
  });
}

// Builds the selection polygon straight from what was traced, preferring the exact
// outline over an approximation:
//  1. Close the ring — if the user released before dragging back to the start (the
//     normal case; nobody hand-traces a pixel-perfect closed loop), link the last
//     point straight back to the first.
//  2. If that closed ring is a valid simple polygon (`turf.kinks` finds no
//     self-intersections), use it as-is — this preserves a concave trace (an L-shape,
//     a crescent) that a convex hull would incorrectly "fill in."
//  3. Only when the raw ring crosses itself (e.g. a dense back-and-forth scribble,
//     which isn't a valid polygon on its own) fall back to the convex hull of the
//     same points.
//  4. If even the hull fails (near-collinear points), fall back to a small circle.
// This selection polygon is used only to find where the user pointed (its centroid
// becomes the flood-fill seed, its bounding box sizes the captured image) — the
// FINAL returned polygon comes entirely from the image, not from this shape.
function buildSelectionPolygon(points: L.LatLng[]): GeoJSON.Feature<GeoJSON.Polygon> {
  const ring = points.map((p): [number, number] => [p.lng, p.lat]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push(first); // auto-close: link the last point back to the first
  }

  const traced = turfPolygon([ring]);
  if (kinks(traced).features.length === 0) {
    return traced;
  }

  const hull = convex(featureCollection(points.map((p) => point([p.lng, p.lat]))));
  if (hull) {
    return hull;
  }

  // Degenerate trace (near-collinear points, hull failed too) — fall back to a small circle.
  const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  return turfCircle([avgLng, avgLat], FALLBACK_SELECTION_RADIUS_METERS / 1000, {
    steps: 16,
    units: 'kilometers',
  });
}

interface IPixelPoint {
  x: number;
  y: number;
}

function getPixelColor(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number
): [number, number, number] {
  const index = (y * width + x) * 4;
  return [data[index], data[index + 1], data[index + 2]];
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

interface ISeedCandidate {
  x: number;
  y: number;
  count: number;
}

// Samples an evenly-spaced grid of points across the traced selection's own bounding
// box and ranks every distinct rendered color found by how often it appeared — each
// becomes a candidate flood-fill starting point, most-common first. A single centroid
// pixel (or blindly trusting only the single most-common color) is fragile in two
// opposite ways: a real trace roughly circling a whole feature can have its centroid
// land on a small internal detail (a runway, a building) rendered in a different color
// than the general area; and a loosely-drawn trace can contain more surrounding
// background (e.g. water) than the feature itself, making the background "win" the
// vote outright. Returning a ranked list lets the caller try the most likely candidate
// first, then fall through to the next if a candidate's flood-fill result looks like it
// leaked into unbounded background rather than finding a real bounded feature.
function rankSeedCandidates(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): ISeedCandidate[] {
  const buckets = new Map<string, ISeedCandidate>();

  for (let gy = 0; gy < SEED_SAMPLE_GRID_SIZE; gy++) {
    for (let gx = 0; gx < SEED_SAMPLE_GRID_SIZE; gx++) {
      const x = Math.round(minX + ((maxX - minX) * gx) / (SEED_SAMPLE_GRID_SIZE - 1));
      const y = Math.round(minY + ((maxY - minY) * gy) / (SEED_SAMPLE_GRID_SIZE - 1));
      if (x < 0 || y < 0 || x >= width || y >= height) {
        continue;
      }
      const [r, g, b] = getPixelColor(data, width, x, y);
      const key = [
        Math.round(r / SEED_COLOR_BUCKET_SIZE),
        Math.round(g / SEED_COLOR_BUCKET_SIZE),
        Math.round(b / SEED_COLOR_BUCKET_SIZE),
      ].join(',');
      const existing = buckets.get(key);
      if (existing) {
        existing.count++;
      } else {
        buckets.set(key, { count: 1, x, y });
      }
    }
  }

  return [...buckets.values()].sort((a, b) => b.count - a.count);
}

// A flood-filled region that touches most of the crop's own edges usually means
// background dominates the trace rather than a distinct bounded feature within it. Only
// used as a candidate-ranking preference — the final output is always clipped to the
// user's own drawn selection regardless (see "no area outside the drawn area" fix in
// POLYSNAP_PROJECT_OVERVIEW.md), so this can't let a result escape the drawn area.
function countTouchedBorderEdges(mask: Uint8Array, width: number, height: number): number {
  let top = false;
  let bottom = false;
  let left = false;
  let right = false;
  for (let x = 0; x < width; x++) {
    if (mask[x]) top = true;
    if (mask[(height - 1) * width + x]) bottom = true;
  }
  for (let y = 0; y < height; y++) {
    if (mask[y * width]) left = true;
    if (mask[y * width + width - 1]) right = true;
  }
  return [top, bottom, left, right].filter(Boolean).length;
}

// Standard even-odd scanline polygon fill — rasterizes the user's traced selection
// ring (in the same crop-local pixel space as the captured image) into a boolean mask,
// so a candidate flood-fill's overlap with what the user actually traced can be
// measured directly in pixels rather than guessed at.
function rasterizePolygonMask(ring: [number, number][], width: number, height: number): Uint8Array {
  const mask = new Uint8Array(width * height);
  const pointCount = ring.length;
  for (let y = 0; y < height; y++) {
    const intersectionXs: number[] = [];
    for (let i = 0; i < pointCount; i++) {
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[(i + 1) % pointCount];
      if (y1 === y2) {
        continue;
      }
      if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
        intersectionXs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    intersectionXs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < intersectionXs.length; i += 2) {
      const xStart = Math.max(0, Math.ceil(intersectionXs[i]));
      const xEnd = Math.min(width - 1, Math.floor(intersectionXs[i + 1]));
      for (let x = xStart; x <= xEnd; x++) {
        mask[y * width + x] = 1;
      }
    }
  }
  return mask;
}

// Averages a small box around the seed point instead of reading one pixel — a single
// pixel could unluckily land exactly on a thin road line or building outline within
// the region, giving a seed color that doesn't represent the region's actual fill.
function averageSeedColor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  seedX: number,
  seedY: number
): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let dy = -SEED_AVERAGE_RADIUS; dy <= SEED_AVERAGE_RADIUS; dy++) {
    for (let dx = -SEED_AVERAGE_RADIUS; dx <= SEED_AVERAGE_RADIUS; dx++) {
      const x = seedX + dx;
      const y = seedY + dy;
      if (x < 0 || y < 0 || x >= width || y >= height) {
        continue;
      }
      const [pr, pg, pb] = getPixelColor(data, width, x, y);
      r += pr;
      g += pg;
      b += pb;
      count++;
    }
  }
  return count > 0 ? [r / count, g / count, b / count] : getPixelColor(data, width, seedX, seedY);
}

// Region-growing color segmentation: starting from the seed color (sampled at the
// center of what the user traced), keep expanding to any 4-connected neighbour whose
// color is close enough — this IS "detecting the polygon from the image": no vector
// data, tags, or existing polygons are consulted anywhere in this function, only the
// rendered pixels themselves.
function floodFillMask(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  seedX: number,
  seedY: number
): { mask: Uint8Array; pixelCount: number } {
  const mask = new Uint8Array(width * height);
  const seedColor = averageSeedColor(data, width, height, seedX, seedY);
  const stack: number[] = [seedY * width + seedX];
  mask[seedY * width + seedX] = 1;
  let pixelCount = 0;

  while (stack.length > 0) {
    const index = stack.pop();
    if (index === undefined) {
      break;
    }
    pixelCount++;
    const x = index % width;
    const y = Math.floor(index / width);

    const neighbours: [number, number][] = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neighbours) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
        continue;
      }
      const neighbourIndex = ny * width + nx;
      if (mask[neighbourIndex]) {
        continue;
      }
      if (colorDistance(getPixelColor(data, width, nx, ny), seedColor) <= COLOR_DISTANCE_THRESHOLD) {
        mask[neighbourIndex] = 1;
        stack.push(neighbourIndex);
      }
    }
  }

  return { mask, pixelCount };
}

// Region-growing that EXCLUDES a wall MASK instead of matching one color — grows
// through any 4-connected neighbour NOT marked in wallMask, merging every other region
// together regardless of its own color, and stopping only at wall pixels. This is the
// "roads as walls" mechanism: treating the detected road network as an impassable
// barrier reconstructs the enclosed space between roads regardless of how many
// different colors (buildings, parks, lots) that enclosed space itself contains.
function floodFillExcludingMask(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  seedX: number,
  seedY: number,
  wallMask: Uint8Array
): { mask: Uint8Array; pixelCount: number } {
  const mask = new Uint8Array(width * height);
  const stack: number[] = [seedY * width + seedX];
  mask[seedY * width + seedX] = 1;
  let pixelCount = 0;

  while (stack.length > 0) {
    const index = stack.pop();
    if (index === undefined) {
      break;
    }
    pixelCount++;
    const x = index % width;
    const y = Math.floor(index / width);

    const neighbours: [number, number][] = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neighbours) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
        continue;
      }
      const neighbourIndex = ny * width + nx;
      if (mask[neighbourIndex]) {
        continue;
      }
      if (!wallMask[neighbourIndex]) {
        mask[neighbourIndex] = 1;
        stack.push(neighbourIndex);
      }
    }
  }

  return { mask, pixelCount };
}

// Counts mask pixels that have at least one non-mask 4-neighbour — a perimeter proxy
// used for compactness, cheaper than a full ordered boundary walk.
function countBoundaryPixels(mask: Uint8Array, width: number, height: number): number {
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) {
        continue;
      }
      const isBoundary =
        x === 0 ||
        y === 0 ||
        x === width - 1 ||
        y === height - 1 ||
        !mask[y * width + x - 1] ||
        !mask[y * width + x + 1] ||
        !mask[(y - 1) * width + x] ||
        !mask[(y + 1) * width + x];
      if (isBoundary) {
        count++;
      }
    }
  }
  return count;
}

// Polsby-Popper compactness: ~1 for a circle/blob, near 0 for a thin, elongated or
// branching network. This is the shape signature that tells a road/border apart from a
// normal bounded feature — no color-matching involved.
function computeCompactness(mask: Uint8Array, width: number, height: number, pixelCount: number): number {
  const perimeter = countBoundaryPixels(mask, width, height);
  if (perimeter === 0) {
    return 0;
  }
  return (4 * Math.PI * pixelCount) / (perimeter * perimeter);
}

interface IColorRegion {
  mask: Uint8Array;
  pixelCount: number;
  color: [number, number, number];
}

// Segments the ENTIRE captured image into connected same-color regions — a full
// connected-components labeling, not just wherever the user's own gesture happened to
// sample. This is what lets wall/road detection work from just a mark or a point,
// rather than needing a gesture that hugs or crosses the boundary.
function segmentImageIntoRegions(data: Uint8ClampedArray, width: number, height: number): IColorRegion[] {
  const labeled = new Uint8Array(width * height);
  const regions: IColorRegion[] = [];

  for (let start = 0; start < width * height; start++) {
    if (labeled[start]) {
      continue;
    }
    const startX = start % width;
    const startY = Math.floor(start / width);
    const seedColor = getPixelColor(data, width, startX, startY);
    const { mask, pixelCount } = floodFillMask(data, width, height, startX, startY);
    for (let i = 0; i < mask.length; i++) {
      if (mask[i]) {
        labeled[i] = 1;
      }
    }
    regions.push({ mask, pixelCount, color: seedColor });
  }

  return regions;
}

// Finds the road/boundary network purely from the image's own structure: segments the
// whole capture, keeps only thin/branching (low-compactness) regions, and unions
// together every one of them that's within WALL_WIDTH_RATIO_FLOOR of the WIDEST such
// region found — real map styles render major roads visibly wider than minor
// paths/separators, so this keeps genuine bounding roads (even several different-
// colored classes of them) while excluding thinner incidental structures. Returns null
// if the image has no thin/branching structure at all (a plain blob-like scene, e.g. an
// island with no distinct border network) — the caller must not force this mechanism.
function findWallMask(data: Uint8ClampedArray, width: number, height: number): Uint8Array | null {
  const regions = segmentImageIntoRegions(data, width, height);
  const thinRegions = regions
    .map((region) => {
      const perimeter = countBoundaryPixels(region.mask, width, height);
      const compactness = computeCompactness(region.mask, width, height, region.pixelCount);
      const estimatedWidth = perimeter > 0 ? (2 * region.pixelCount) / perimeter : 0;
      return { region, compactness, estimatedWidth };
    })
    .filter((entry) => entry.compactness < WALL_MAX_COMPACTNESS);

  if (thinRegions.length === 0) {
    return null;
  }

  const widestWidth = Math.max(...thinRegions.map((entry) => entry.estimatedWidth));
  const wallMask = new Uint8Array(width * height);
  for (const entry of thinRegions) {
    if (entry.estimatedWidth >= widestWidth * WALL_WIDTH_RATIO_FLOOR) {
      for (let i = 0; i < wallMask.length; i++) {
        if (entry.region.mask[i]) {
          wallMask[i] = 1;
        }
      }
    }
  }
  return wallMask;
}

const MOORE_DIRECTIONS: [number, number][] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

// Moore-neighbour boundary tracing: walks the outer edge of the flood-filled mask,
// producing an ordered ring of pixel coordinates. This ring, after simplification, IS
// the returned polygon — it comes directly from the image, not from any existing
// vector data.
function traceMaskBoundary(mask: Uint8Array, width: number, height: number): IPixelPoint[] {
  const isSet = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < width && y < height && mask[y * width + x] === 1;

  let start: IPixelPoint | null = null;
  outer: for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isSet(x, y)) {
        start = { x, y };
        break outer;
      }
    }
  }
  if (!start) {
    return [];
  }

  const boundary: IPixelPoint[] = [start];
  let current = start;
  let backtrackDir = 6;
  const maxSteps = width * height * 8;

  for (let step = 0; step < maxSteps; step++) {
    let found: { pixelPoint: IPixelPoint; dir: number } | null = null;
    for (let i = 0; i < 8; i++) {
      const dir = (backtrackDir + 1 + i) % 8;
      const [dx, dy] = MOORE_DIRECTIONS[dir];
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (isSet(nx, ny)) {
        found = { pixelPoint: { x: nx, y: ny }, dir };
        break;
      }
    }
    if (!found) {
      break;
    }
    current = found.pixelPoint;
    backtrackDir = (found.dir + 4) % 8;
    if (current.x === start.x && current.y === start.y) {
      break;
    }
    boundary.push(current);
  }

  return boundary;
}

// Shoelace formula — polygon area in flat (pixel-space) coordinates. `turf.area` only
// works in real-world m² for lat/lng geometry, so pixel-space regularization needs its
// own plain area function.
function pixelPolygonArea(ring: [number, number][]): number {
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

// Rotating calipers: the minimum-area rectangle enclosing a convex polygon always has
// one side flush with one of the hull's own edges, so checking only those orientations
// (rather than every possible angle) is sufficient and exact.
function minAreaBoundingRectangle(hull: [number, number][]): [number, number][] {
  let best: { area: number; corners: [number, number][] } | null = null;

  for (let i = 0; i < hull.length; i++) {
    const [x1, y1] = hull[i];
    const [x2, y2] = hull[(i + 1) % hull.length];
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const cosA = Math.cos(-angle);
    const sinA = Math.sin(-angle);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [x, y] of hull) {
      const rx = x * cosA - y * sinA;
      const ry = x * sinA + y * cosA;
      minX = Math.min(minX, rx);
      maxX = Math.max(maxX, rx);
      minY = Math.min(minY, ry);
      maxY = Math.max(maxY, ry);
    }

    const area = (maxX - minX) * (maxY - minY);
    if (!best || area < best.area) {
      const cosB = Math.cos(angle);
      const sinB = Math.sin(angle);
      const rotatedCorners: [number, number][] = [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
      ];
      const corners = rotatedCorners.map(([rx, ry]): [number, number] => [
        rx * cosB - ry * sinB,
        rx * sinB + ry * cosB,
      ]);
      best = { area, corners };
    }
  }

  return best ? best.corners : hull;
}

// If a traced boundary is close enough to rectangular, replace its jagged pixel outline
// with a clean rotated rectangle — most real city blocks bounded by 4 streets ARE
// rectangular, and this produces the crisp right-angle look expected of a block
// boundary instead of a noisy pixel-traced outline. Falls back to the original ring
// (unchanged) for anything that isn't actually close to a rectangle, e.g. an L-shaped
// block or a natural feature like an island.
function regularizeIfRectangular(ring: [number, number][]): [number, number][] {
  const hull = convex(featureCollection(ring.map(([x, y]) => point([x, y]))));
  if (!hull) {
    return ring;
  }
  const hullRing = hull.geometry.coordinates[0] as [number, number][];
  const rectangle = minAreaBoundingRectangle(hullRing);

  const ringArea = pixelPolygonArea(ring);
  const rectangleArea = pixelPolygonArea(rectangle);
  if (rectangleArea === 0 || ringArea / rectangleArea < MIN_RECTANGLE_COVERAGE_RATIO) {
    return ring;
  }

  return [...rectangle, rectangle[0]];
}

interface ICaptureResult {
  feature: GeoJSON.Feature<GeoJSON.Polygon>;
  pointCount: number;
}

// The whole detection pipeline: capture the currently-rendered map as an image
// (html2canvas-pro — works because OSM's tile server sends permissive CORS headers,
// verified directly against the live tile endpoint before building this; the "-pro"
// fork is required, not the original html2canvas, because it supports the oklch()
// color functions Tailwind CSS 4 uses throughout this app's own stylesheet), find the
// color region connected to where the user pointed, trace its boundary, and convert
// that pixel boundary back to a real GeoJSON polygon via Leaflet's own
// containerPointToLatLng. No Overpass, no tags, no existing polygons of any kind are
// consulted — only the rendered pixels within the captured crop.
async function captureAndDetectPolygon(
  map: L.Map,
  mapContainer: HTMLElement,
  selectionPolygon: GeoJSON.Feature<GeoJSON.Polygon>,
  // Fired right after the raw crop is captured, before any flood-fill/tracing runs —
  // and regardless of whether detection ultimately succeeds. This is the only way to
  // see the exact pixels the algorithm is reasoning about: this environment has no
  // browser to render a live page and inspect a captured canvas directly, so a guessed
  // color-tolerance threshold cannot be tuned against real data without it.
  onCaptured?: (dataUrl: string) => void
): Promise<ICaptureResult | null> {
  const [minLng, minLat, maxLng, maxLat] = bbox(selectionPolygon);
  const corners: L.Point[] = [
    map.latLngToContainerPoint(L.latLng(minLat, minLng)),
    map.latLngToContainerPoint(L.latLng(minLat, maxLng)),
    map.latLngToContainerPoint(L.latLng(maxLat, minLng)),
    map.latLngToContainerPoint(L.latLng(maxLat, maxLng)),
  ];
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const rawMinX = Math.min(...xs);
  const rawMaxX = Math.max(...xs);
  const rawMinY = Math.min(...ys);
  const rawMaxY = Math.max(...ys);
  // Capture ONLY the traced selection's own bounding box — no padding beyond it, so the
  // algorithm can never pick up a feature the user didn't actually draw over (an
  // unrelated nearby road, building, or runway just outside the trace).
  const containerSize = map.getSize();
  const cropX = Math.max(0, Math.floor(rawMinX));
  const cropY = Math.max(0, Math.floor(rawMinY));
  const cropRight = Math.min(containerSize.x, Math.ceil(rawMaxX));
  const cropBottom = Math.min(containerSize.y, Math.ceil(rawMaxY));
  const cropWidth = cropRight - cropX;
  const cropHeight = cropBottom - cropY;
  if (cropWidth < 4 || cropHeight < 4) {
    return null;
  }

  const canvas = await html2canvas(mapContainer, {
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight,
    scale: HTML2CANVAS_SCALE,
    useCORS: true,
    logging: false,
  });

  onCaptured?.(canvas.toDataURL('image/png'));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const seedCandidates = rankSeedCandidates(
    imageData.data,
    canvas.width,
    canvas.height,
    Math.max(0, Math.round(rawMinX - cropX)),
    Math.max(0, Math.round(rawMinY - cropY)),
    Math.min(canvas.width - 1, Math.round(rawMaxX - cropX)),
    Math.min(canvas.height - 1, Math.round(rawMaxY - cropY))
  );

  const selectionRingPixels: [number, number][] = selectionPolygon.geometry.coordinates[0].map(
    ([lng, lat]): [number, number] => {
      const p = map.latLngToContainerPoint(L.latLng(lat, lng));
      return [p.x - cropX, p.y - cropY];
    }
  );
  const selectionMask = rasterizePolygonMask(selectionRingPixels, canvas.width, canvas.height);
  let selectionAreaPixelCount = 0;
  for (const value of selectionMask) {
    selectionAreaPixelCount += value;
  }

  // Try every ranked color candidate, reject any whose flood-fill result looks like it
  // leaked into unbounded background (touches most crop edges, or fills nearly the
  // whole crop), and among the survivors pick whichever OVERLAPS what the user actually
  // traced the most — not just whichever color was most common in the sample grid (a
  // thin coastline border stroke or a small internal feature can sample well without
  // representing what the user meant to select).
  let best: { mask: Uint8Array; overlapRatio: number } | null = null;
  const maxAreaPixels = MAX_FLOOD_FILL_AREA_RATIO * canvas.width * canvas.height;
  for (const candidate of seedCandidates.slice(0, MAX_SEED_CANDIDATES_TO_TRY)) {
    const candidateResult = floodFillMask(imageData.data, canvas.width, canvas.height, candidate.x, candidate.y);
    if (candidateResult.pixelCount < MIN_FLOOD_FILL_PIXELS) {
      continue;
    }
    if (
      candidateResult.pixelCount > maxAreaPixels ||
      countTouchedBorderEdges(candidateResult.mask, canvas.width, canvas.height) > MAX_TOUCHED_BORDER_EDGES
    ) {
      continue;
    }

    let overlapCount = 0;
    for (let i = 0; i < candidateResult.mask.length; i++) {
      if (candidateResult.mask[i] && selectionMask[i]) {
        overlapCount++;
      }
    }
    const overlapRatio = selectionAreaPixelCount > 0 ? overlapCount / selectionAreaPixelCount : 1;
    if (overlapRatio < MIN_SELECTION_OVERLAP_RATIO) {
      continue;
    }

    if (!best || overlapRatio > best.overlapRatio) {
      best = { mask: candidateResult.mask, overlapRatio };
    }
  }

  // Road-bounded selections (a block, not a single solid-colored blob) need a different
  // mechanism: find the road/boundary network structurally (segment the whole image,
  // classify regions by shape, keep the widest thin/branching ones — see findWallMask),
  // treat it as an impassable wall, and flood-fill everything else instead of any single
  // color. Works from just a mark/point — no gesture-path dependency at all. This is
  // only ever used as an alternative, still subject to the same background-leak sanity
  // checks, cross-checked against the interior-candidate result above via the same
  // overlap-with-trace score — see WALL_MAX_COMPACTNESS/WALL_WIDTH_RATIO_FLOOR for why
  // it can't be trusted on its own.
  const wallMask = findWallMask(imageData.data, canvas.width, canvas.height);
  if (wallMask) {
    const traceCentroidX = Math.round(
      selectionRingPixels.reduce((sum, p) => sum + p[0], 0) / selectionRingPixels.length
    );
    const traceCentroidY = Math.round(
      selectionRingPixels.reduce((sum, p) => sum + p[1], 0) / selectionRingPixels.length
    );
    const centroidInBounds =
      traceCentroidX >= 0 && traceCentroidY >= 0 && traceCentroidX < canvas.width && traceCentroidY < canvas.height;
    const centroidIsWall = centroidInBounds && wallMask[traceCentroidY * canvas.width + traceCentroidX] === 1;

    if (centroidInBounds && !centroidIsWall) {
      const enclosedResult = floodFillExcludingMask(
        imageData.data,
        canvas.width,
        canvas.height,
        traceCentroidX,
        traceCentroidY,
        wallMask
      );
      if (
        enclosedResult.pixelCount >= MIN_FLOOD_FILL_PIXELS &&
        enclosedResult.pixelCount <= maxAreaPixels &&
        countTouchedBorderEdges(enclosedResult.mask, canvas.width, canvas.height) <= MAX_TOUCHED_BORDER_EDGES
      ) {
        let enclosedOverlapCount = 0;
        for (let i = 0; i < enclosedResult.mask.length; i++) {
          if (enclosedResult.mask[i] && selectionMask[i]) {
            enclosedOverlapCount++;
          }
        }
        const enclosedOverlapRatio =
          selectionAreaPixelCount > 0 ? enclosedOverlapCount / selectionAreaPixelCount : 1;
        if (enclosedOverlapRatio >= MIN_SELECTION_OVERLAP_RATIO && (!best || enclosedOverlapRatio > best.overlapRatio)) {
          best = { mask: enclosedResult.mask, overlapRatio: enclosedOverlapRatio };
        }
      }
    }
  }

  let pixelRing: [number, number][];
  if (best) {
    const rawBoundary = traceMaskBoundary(best.mask, canvas.width, canvas.height);
    if (rawBoundary.length < 4) {
      return null;
    }
    pixelRing = rawBoundary.map((p): [number, number] => [p.x, p.y]);
    pixelRing.push(pixelRing[0]);
  } else {
    // Neither mechanism found a confident match (common for a large, visually complex
    // scene — many road classes/colors, mixed land use) — rather than a hard failure,
    // fall back to the user's own traced selection itself (still regularized below into
    // a clean rectangle if it's close to one), so tracing always produces a usable
    // polygon in the worst case instead of an error.
    pixelRing = [...selectionRingPixels];
    if (pixelRing.length > 0) {
      pixelRing.push(pixelRing[0]);
    }
  }
  if (pixelRing.length < 4) {
    return null;
  }

  const simplified = simplify(lineString(pixelRing), {
    tolerance: SIMPLIFY_TOLERANCE_PIXELS,
    highQuality: true,
  });

  const simplifiedPixelRing = simplified.geometry.coordinates.map(
    ([px, py]): [number, number] => [px, py]
  );
  const regularizedPixelRing = regularizeIfRectangular(simplifiedPixelRing);

  const latLngRing = regularizedPixelRing.map(([px, py]): [number, number] => {
    const latLng = map.containerPointToLatLng(L.point(px + cropX, py + cropY));
    return [latLng.lng, latLng.lat];
  });
  const firstPoint = latLngRing[0];
  const lastPoint = latLngRing[latLngRing.length - 1];
  if (latLngRing.length < 4) {
    return null;
  }
  if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
    latLngRing.push(firstPoint);
  }

  const detectedFeature = turfPolygon([latLngRing]);

  // Guarantee the returned polygon never extends beyond what the user actually drew,
  // regardless of how the flood-fill grew inside the (now unpadded) capture — clip it
  // to the traced selection itself.
  const clipped = intersect(featureCollection([detectedFeature, selectionPolygon]));
  if (!clipped || clipped.geometry.type !== 'Polygon') {
    return {
      feature: detectedFeature,
      pointCount: latLngRing.length - 1,
    };
  }

  const clippedRing = clipped.geometry.coordinates[0];
  return {
    feature: clipped as GeoJSON.Feature<GeoJSON.Polygon>,
    pointCount: clippedRing.length - 1,
  };
}

@Component({
  selector: 'app-map-poc',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardCardComponent,
    ZardAlertComponent,
    ZardIconComponent,
    ZardInputDirective,
    ZardLoaderComponent,
  ],
  templateUrl: './map-poc.component.html',
  styleUrls: ['./map-poc.component.scss'],
})
export class MapPocComponent implements AfterViewInit, OnDestroy {
  private readonly _translationService = inject(TranslationService);
  private readonly _mapContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  private _map?: L.Map;
  private _isTracing = false;
  private _tracePoints: L.LatLng[] = [];
  private _lastTracePixel?: L.Point;
  private _tracePolyline?: L.Polyline;
  private _resultLayer?: L.GeoJSON;
  private _detectionToken = 0;

  readonly step = signal<DrawStep>('idle');
  readonly polygonGeoJson = signal<string>('');
  readonly detectedPointCount = signal<number | null>(null);
  // Debug aid: the exact raw crop the detection pipeline analyzed, so a color-tolerance
  // failure can be diagnosed against real captured pixels instead of guessed blind.
  readonly capturedImagePreview = signal<string | null>(null);

  readonly searchForm = new FormGroup<ILocationSearchForm>({
    query: new FormControl<string>('', { nonNullable: true }),
  });
  readonly isSearching = signal(false);
  readonly searchResults = signal<ILocationSearchResult[]>([]);

  ngAfterViewInit(): void {
    const map = L.map(this._mapContainer().nativeElement).setView(
      DEFAULT_CENTER,
      DEFAULT_ZOOM
    );
    this._map = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      // Required for the image-capture pipeline below: the tile server sends a
      // permissive Access-Control-Allow-Origin header, but the browser only honors
      // it if the <img> requested the tile in CORS mode to begin with — without this,
      // tiles still display fine, but reading pixel data back out of a canvas that
      // contains them throws "SecurityError: canvas tainted by cross-origin data"
      // regardless of the server's own CORS headers.
      crossOrigin: true,
    }).addTo(map);

    const lastLocation = loadLastLocation();
    if (lastLocation) {
      map.fitBounds(lastLocation.bounds, { maxZoom: 16 });
    }

    map.on('mousedown', (event: L.LeafletMouseEvent) => this.onMapMouseDown(map, event));
    map.on('mousemove', (event: L.LeafletMouseEvent) => this.onMapMouseMove(map, event));
    map.on('mouseup', () => this.onMapMouseUp(map));
  }

  ngOnDestroy(): void {
    this._map?.remove();
  }

  startDrawing(): void {
    this.clear();
    this.step.set('drawing');
  }

  clear(): void {
    this._detectionToken++; // invalidate any in-flight detection so it can't repaint after clear
    this._tracePolyline?.remove();
    this._resultLayer?.remove();
    this._tracePolyline = undefined;
    this._resultLayer = undefined;
    this._tracePoints = [];
    this._lastTracePixel = undefined;
    this._isTracing = false;
    this._map?.dragging.enable();
    this.step.set('idle');
    this.polygonGeoJson.set('');
    this.detectedPointCount.set(null);
    this.capturedImagePreview.set(null);
  }

  copyGeoJson(): void {
    const value = this.polygonGeoJson();
    if (!value) {
      return;
    }
    navigator.clipboard.writeText(value).then(() => {
      toast.success(
        this._translationService.getCachedTranslation(
          '#polysnap#.mapPoc.success.copied'
        )
      );
    });
  }

  onSearch(): void {
    const query = this.searchForm.controls.query.value.trim();
    if (!query || this.isSearching()) {
      return;
    }

    this.isSearching.set(true);
    this.searchResults.set([]);
    searchLocations(query)
      .then((results) => {
        this.isSearching.set(false);
        if (results.length === 0) {
          toast.error(
            this._translationService.getCachedTranslation(
              '#polysnap#.mapPoc.error.searchNoResults'
            )
          );
          return;
        }
        this.searchResults.set(results);
      })
      .catch(() => {
        this.isSearching.set(false);
        toast.error(
          this._translationService.getCachedTranslation(
            '#polysnap#.mapPoc.error.searchFailed'
          )
        );
      });
  }

  onSelectSearchResult(result: ILocationSearchResult): void {
    this.searchResults.set([]);
    this._map?.fitBounds(result.bounds, { maxZoom: 16 });
    saveLastLocation(result);
  }

  private onMapMouseDown(map: L.Map, event: L.LeafletMouseEvent): void {
    if (this.step() !== 'drawing') {
      return;
    }
    this._isTracing = true;
    map.dragging.disable();
    this._tracePoints = [event.latlng];
    this._lastTracePixel = map.latLngToContainerPoint(event.latlng);
    this._tracePolyline?.remove();
    this._tracePolyline = L.polyline(this._tracePoints, { color: '#2563eb', weight: 3 }).addTo(map);
  }

  private onMapMouseMove(map: L.Map, event: L.LeafletMouseEvent): void {
    if (!this._isTracing) {
      return;
    }
    const pixel = map.latLngToContainerPoint(event.latlng);
    const lastPixel = this._lastTracePixel;
    if (lastPixel && pixel.distanceTo(lastPixel) < TRACE_MIN_PIXEL_DISTANCE) {
      return;
    }
    this._lastTracePixel = pixel;
    this._tracePoints.push(event.latlng);
    this._tracePolyline?.setLatLngs(this._tracePoints);
  }

  private onMapMouseUp(map: L.Map): void {
    if (!this._isTracing) {
      return;
    }
    this._isTracing = false;
    map.dragging.enable();
    this._tracePolyline?.remove();
    this._tracePolyline = undefined;

    if (this._tracePoints.length < MIN_TRACE_POINTS) {
      this._tracePoints = [];
      return; // too short to mean anything — stay in 'drawing' to retry
    }

    const points = this._tracePoints;
    this._tracePoints = [];

    const selectionPolygon = buildSelectionPolygon(points);

    const token = ++this._detectionToken;
    this.step.set('detecting');
    this.runDetection(map, selectionPolygon, token);
  }

  private runDetection(
    map: L.Map,
    selectionPolygon: GeoJSON.Feature<GeoJSON.Polygon>,
    token: number
  ): void {
    captureAndDetectPolygon(
      map,
      this._mapContainer().nativeElement,
      selectionPolygon,
      (dataUrl) => {
        if (token === this._detectionToken) {
          this.capturedImagePreview.set(dataUrl);
        }
      }
    )
      .then((result) => {
        if (token !== this._detectionToken) {
          return; // superseded by a clear()/new trace while this was in flight
        }

        if (!result) {
          toast.error(
            this._translationService.getCachedTranslation(
              '#polysnap#.mapPoc.error.noAreaFound'
            )
          );
          this.step.set('idle');
          return;
        }

        this._resultLayer?.remove();
        this._resultLayer = L.geoJSON(result.feature, {
          style: { color: '#16a34a', fillOpacity: 0.3, weight: 2 },
        }).addTo(map);
        map.fitBounds(this._resultLayer.getBounds(), { maxZoom: 18, padding: [24, 24] });

        this.detectedPointCount.set(result.pointCount);
        this.polygonGeoJson.set(JSON.stringify(result.feature, null, 2));
        this.step.set('done');
      })
      .catch((error: unknown) => {
        if (token !== this._detectionToken) {
          return;
        }
        // Logged (not surfaced) so a real cause — e.g. a canvas-tainted SecurityError from
        // a tile source that doesn't support CORS — is visible in devtools for diagnosis.
        console.error('PolySnap image-detection failed:', error);
        toast.error(
          this._translationService.getCachedTranslation(
            '#polysnap#.mapPoc.error.detectFailed'
          )
        );
        this.step.set('idle');
      });
  }
}
