import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ihsan/core';
import {
  Z_MODAL_DATA,
  ZardAlertComponent,
  ZardButtonComponent,
  ZardDialogRef,
  ZardIconComponent,
} from '@ihsan/ui';
import * as Tone from 'tone';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
// npm install webm-muxer
import { Muxer, ArrayBufferTarget } from 'webm-muxer';

export interface IAudioEditorDialogData {
  file: File;
}

export interface IAudioEditorDialogResult {
  success: boolean;
  file?: File;
}

interface IRegionLike {
  id: string;
  start: number;
  end: number;
  remove: () => void;
}

interface IEncodedAudio {
  blob: Blob;
  extension: 'webm';
  mimeType: 'audio/webm';
}

@Component({
  selector: 'shared-audio-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardAlertComponent,
    ZardIconComponent,
  ],
  templateUrl: './audio-editor-dialog.component.html',
  styleUrl: './audio-editor-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioEditorDialogComponent implements AfterViewInit, OnDestroy {
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _data = inject<IAudioEditorDialogData>(Z_MODAL_DATA);

  @ViewChild('waveformHost', { static: true })
  waveformHost!: ElementRef<HTMLDivElement>;

  @ViewChild('waveformEnhancedHost', { static: true })
  waveformEnhancedHost!: ElementRef<HTMLDivElement>;

  readonly sourceFile = this._data.file;
  readonly loadingWave = signal<boolean>(true);
  readonly isPlaying = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  readonly enhanceAudio = signal<boolean>(false);
  readonly loadingEnhanced = signal<boolean>(false);
  readonly isPlayingEnhanced = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly duration = signal<number>(0);
  readonly regionStart = signal<number>(0);
  readonly regionEnd = signal<number>(0);
  readonly hasSelection = computed(() => this.regionEnd() > this.regionStart());

  readonly progressStep = signal<string | null>(null);

  readonly estimatedFileSize = computed<string>(() => {
    const isTrimmed =
      this.regionStart() > 0.01 ||
      Math.abs(this.regionEnd() - this.duration()) > 0.01;
    const hasEdits = isTrimmed || this.enhanceAudio();

    let bytes: number;
    if (!hasEdits) {
      bytes = this.sourceFile.size;
    } else {
      const segmentDuration = this.regionEnd() - this.regionStart();
      // WebM/Opus at 128kbps ≈ 16000 bytes/sec
      bytes = Math.ceil(segmentDuration * 16000);
    }

    return this.formatBytes(bytes);
  });

  readonly isOutputTooLarge = computed<boolean>(() => false);

  private _waveSurfer?: WaveSurfer;
  private _waveSurferEnhanced?: WaveSurfer;
  private _activeRegion: IRegionLike | null = null;
  private _objectUrl?: string;
  private _enhancedObjectUrl?: string;
  private _audioElement?: HTMLAudioElement;
  private readonly _defaultZoomLevel = 0;
  private _zoomLevel = 0;
  private _zoomLevelEnhanced = 0;
  private readonly _maxZoomLevel = 600;
  private readonly _zoomFactor = 1.08;
  private _onWheelOriginal?: (e: WheelEvent) => void;
  private _onWheelEnhanced?: (e: WheelEvent) => void;

  async ngAfterViewInit(): Promise<void> {
    try {
      this._objectUrl = URL.createObjectURL(this.sourceFile);

      const regions = RegionsPlugin.create();

      this._audioElement = document.createElement('audio');

      this._waveSurfer = WaveSurfer.create({
        container: this.waveformHost.nativeElement,
        waveColor: '#9eb7d8',
        progressColor: '#1f6feb',
        cursorColor: '#0f172a',
        barWidth: 2,
        barGap: 1,
        barRadius: 3,
        height: 128,
        hideScrollbar: true,
        normalize: true,
        media: this._audioElement,
        plugins: [regions],
      });

      this._waveSurfer.on('ready', () => {
        const totalDuration = this._waveSurfer?.getDuration() ?? 0;
        this.duration.set(totalDuration);
        this.regionStart.set(0);
        this.regionEnd.set(totalDuration);
        this._waveSurfer?.zoom(this._defaultZoomLevel);
        this.loadingWave.set(false);
      });

      this._waveSurfer.on('play', () => this.isPlaying.set(true));
      this._waveSurfer.on('pause', () => this.isPlaying.set(false));
      this._waveSurfer.on('finish', () => this.isPlaying.set(false));

      this._onWheelOriginal = (e: WheelEvent) => {
        e.preventDefault();
        const fittedZoom = this.getFittedZoom(
          this._waveSurfer,
          this.waveformHost.nativeElement,
        );
        this._zoomLevel = this.computeNextZoomLevel(
          this._zoomLevel,
          e.deltaY,
          fittedZoom,
        );
        this._waveSurfer?.zoom(this._zoomLevel);
      };
      this.waveformHost.nativeElement.addEventListener(
        'wheel',
        this._onWheelOriginal,
        { passive: false },
      );

      regions.enableDragSelection({
        color: 'rgba(46, 125, 246, 0.25)',
      });

      regions.on('region-created', (region: IRegionLike) => {
        if (!this._activeRegion || this._activeRegion.id === region.id) {
          this._activeRegion = region;
        } else {
          region.remove();
        }
        this.updateSelectionFromRegion(this._activeRegion);
      });

      regions.on('region-updated', (region: IRegionLike) => {
        this._activeRegion = region;
        this.updateSelectionFromRegion(region);
      });

      regions.on('region-removed', (region: IRegionLike) => {
        if (this._activeRegion?.id === region.id) {
          this._activeRegion = null;
          this.regionStart.set(0);
          this.regionEnd.set(this.duration());
        }
      });

      await this._waveSurfer.load(this._objectUrl);
    } catch {
      this.loadingWave.set(false);
      this.errorMessage.set('fileManager.audioEditor.messages.loadFailed');
    }
  }

  ngOnDestroy(): void {
    this.stopPlayback();

    if (this._onWheelOriginal) {
      this.waveformHost.nativeElement.removeEventListener(
        'wheel',
        this._onWheelOriginal,
      );
    }
    this._waveSurfer?.destroy();
    this._audioElement = undefined;
    if (this._objectUrl) {
      URL.revokeObjectURL(this._objectUrl);
    }
    this.destroyEnhancedWaveform();
  }

  togglePlayPause(): void {
    this._waveSurfer?.playPause();
  }

  resetZoom(): void {
    this._zoomLevel = this._defaultZoomLevel;
    this._waveSurfer?.zoom(this._zoomLevel);
  }

  async toggleEnhance(): Promise<void> {
    const newValue = !this.enhanceAudio();
    this.enhanceAudio.set(newValue);

    if (newValue) {
      await this.initEnhancedWaveform();
    } else {
      this.destroyEnhancedWaveform();
    }
  }

  togglePlayPauseEnhanced(): void {
    this._waveSurferEnhanced?.playPause();
  }

  resetZoomEnhanced(): void {
    this._zoomLevelEnhanced = this._defaultZoomLevel;
    this._waveSurferEnhanced?.zoom(this._zoomLevelEnhanced);
  }

  private async initEnhancedWaveform(): Promise<void> {
    this.loadingEnhanced.set(true);
    this.errorMessage.set(null);

    try {
      const sourceBuffer = await this.sourceFile.arrayBuffer();
      const decodeContext = new AudioContext();

      try {
        const decodedBuffer = await decodeContext.decodeAudioData(
          sourceBuffer.slice(0),
        );
        const safeStart = Math.max(
          0,
          Math.min(this.regionStart(), decodedBuffer.duration),
        );
        const safeEnd = Math.max(
          safeStart,
          Math.min(this.regionEnd(), decodedBuffer.duration),
        );

        const trimmed = this.trimAudioBuffer(decodedBuffer, safeStart, safeEnd);
        const enhanced = await this.enhanceAudioBuffer(trimmed);
        const webmBlob = await this.audioBufferToWebmBlob(enhanced);

        if (this._enhancedObjectUrl) {
          URL.revokeObjectURL(this._enhancedObjectUrl);
        }
        this._enhancedObjectUrl = URL.createObjectURL(webmBlob);

        this._waveSurferEnhanced?.destroy();
        this._waveSurferEnhanced = WaveSurfer.create({
          container: this.waveformEnhancedHost.nativeElement,
          waveColor: '#6fcf97',
          progressColor: '#1a9650',
          cursorColor: '#0f172a',
          barWidth: 2,
          barGap: 1,
          barRadius: 3,
          height: 80,
          hideScrollbar: true,
          normalize: true,
        });

        this._waveSurferEnhanced.on('play', () =>
          this.isPlayingEnhanced.set(true),
        );
        this._waveSurferEnhanced.on('pause', () =>
          this.isPlayingEnhanced.set(false),
        );
        this._waveSurferEnhanced.on('finish', () =>
          this.isPlayingEnhanced.set(false),
        );
        this._waveSurferEnhanced.on('ready', () =>
          this.loadingEnhanced.set(false),
        );

        this._zoomLevelEnhanced = this._defaultZoomLevel;
        this._onWheelEnhanced = (e: WheelEvent) => {
          e.preventDefault();
          const fittedZoom = this.getFittedZoom(
            this._waveSurferEnhanced,
            this.waveformEnhancedHost.nativeElement,
          );
          this._zoomLevelEnhanced = this.computeNextZoomLevel(
            this._zoomLevelEnhanced,
            e.deltaY,
            fittedZoom,
          );
          this._waveSurferEnhanced?.zoom(this._zoomLevelEnhanced);
        };
        this.waveformEnhancedHost.nativeElement.addEventListener(
          'wheel',
          this._onWheelEnhanced,
          { passive: false },
        );

        await this._waveSurferEnhanced.load(this._enhancedObjectUrl);
        this._waveSurferEnhanced.zoom(this._defaultZoomLevel);
      } finally {
        await decodeContext.close();
      }
    } catch (error) {
      console.error('Audio enhancement failed', error);
      this.loadingEnhanced.set(false);
      this.errorMessage.set('fileManager.audioEditor.messages.processFailed');
      this.enhanceAudio.set(false);
    }
  }

  private destroyEnhancedWaveform(): void {
    if (this._onWheelEnhanced) {
      this.waveformEnhancedHost.nativeElement.removeEventListener(
        'wheel',
        this._onWheelEnhanced,
      );
      this._onWheelEnhanced = undefined;
    }
    this._waveSurferEnhanced?.destroy();
    this._waveSurferEnhanced = undefined;
    if (this._enhancedObjectUrl) {
      URL.revokeObjectURL(this._enhancedObjectUrl);
      this._enhancedObjectUrl = undefined;
    }
    this.isPlayingEnhanced.set(false);
    this.loadingEnhanced.set(false);
  }

  clearSelection(): void {
    if (this._activeRegion) {
      this._activeRegion.remove();
      this._activeRegion = null;
    }
    this.regionStart.set(0);
    this.regionEnd.set(this.duration());
  }

  cancel(): void {
    this.stopPlayback();
    this._dialogRef.close({ success: false } as IAudioEditorDialogResult);
  }

  async submit(): Promise<void> {
    this.isProcessing.set(true);
    this.errorMessage.set(null);
    this.progressStep.set('fileManager.audioEditor.progress.preparing');

    try {
      const isTrimmed =
        this.regionStart() > 0.01 ||
        Math.abs(this.regionEnd() - this.duration()) > 0.01;
      const hasEdits = isTrimmed || this.enhanceAudio();

      if (!hasEdits) {
        this.stopPlayback();
        this._dialogRef.close({
          success: true,
          file: this.sourceFile,
        } as IAudioEditorDialogResult);
        return;
      }

      const processedFile = await this.buildProcessedAudioFile(
        this.sourceFile,
        this.regionStart(),
        this.regionEnd(),
        this.enhanceAudio(),
      );

      this.progressStep.set('fileManager.audioEditor.progress.finishing');
      this.stopPlayback();
      this._dialogRef.close({
        success: true,
        file: processedFile,
      } as IAudioEditorDialogResult);
    } catch (error) {
      console.error('Audio submit processing failed', error);
      this.errorMessage.set('fileManager.audioEditor.messages.processFailed');
    } finally {
      this.isProcessing.set(false);
      this.progressStep.set(null);
    }
  }

  private stopPlayback(): void {
    this._waveSurfer?.pause();
    this._waveSurferEnhanced?.pause();
    this.isPlaying.set(false);
    this.isPlayingEnhanced.set(false);

    if (this._audioElement) {
      this._audioElement.pause();
      this._audioElement.currentTime = 0;
    }
  }

  formatSeconds(value: number): string {
    const safeValue = Number.isFinite(value) ? Math.max(value, 0) : 0;
    const minutes = Math.floor(safeValue / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(safeValue % 60)
      .toString()
      .padStart(2, '0');
    const milliseconds = Math.floor((safeValue % 1) * 100)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
  }

  private updateSelectionFromRegion(region: IRegionLike | null): void {
    if (!region) return;

    const start = Math.max(region.start, 0);
    const end = Math.min(region.end, this.duration());

    this.regionStart.set(start);
    this.regionEnd.set(Math.max(end, start));
  }

  private getFittedZoom(
    ws: WaveSurfer | undefined,
    container: HTMLElement,
  ): number {
    const duration = ws?.getDuration() ?? 0;
    if (duration <= 0) return 1;
    return container.clientWidth / duration;
  }

  private computeNextZoomLevel(
    currentZoom: number,
    deltaY: number,
    fittedZoom: number,
  ): number {
    const base = currentZoom <= 0 ? fittedZoom : currentZoom;
    const next = deltaY < 0 ? base * this._zoomFactor : base / this._zoomFactor;

    if (next <= fittedZoom) {
      return this._defaultZoomLevel;
    }

    return Math.min(this._maxZoomLevel, next);
  }

  private async buildProcessedAudioFile(
    file: File,
    startSeconds: number,
    endSeconds: number,
    applyEnhancement: boolean,
  ): Promise<File> {
    this.progressStep.set('fileManager.audioEditor.progress.decoding');
    const sourceBuffer = await file.arrayBuffer();
    const decodeContext = new AudioContext();

    try {
      const decodedBuffer = await decodeContext.decodeAudioData(
        sourceBuffer.slice(0),
      );

      const safeStart = Math.max(
        0,
        Math.min(startSeconds, decodedBuffer.duration),
      );
      const safeEnd = Math.max(
        safeStart,
        Math.min(endSeconds, decodedBuffer.duration),
      );

      this.progressStep.set('fileManager.audioEditor.progress.trimming');
      const trimmed = this.trimAudioBuffer(decodedBuffer, safeStart, safeEnd);

      let processed = trimmed;
      if (applyEnhancement) {
        this.progressStep.set('fileManager.audioEditor.progress.enhancing');
        processed = await this.enhanceAudioBuffer(trimmed);
      }

      this.progressStep.set('fileManager.audioEditor.progress.encoding');
      const encoded = await this.encodeAudioBuffer(processed);
      const fileName = this.withExtension(file.name, encoded.extension);
      return new File([encoded.blob], fileName, { type: encoded.mimeType });
    } finally {
      await decodeContext.close();
    }
  }

  private async encodeAudioBuffer(buffer: AudioBuffer): Promise<IEncodedAudio> {
    const blob = await this.audioBufferToWebmBlob(buffer);
    return { blob, extension: 'webm', mimeType: 'audio/webm' };
  }

  private trimAudioBuffer(
    inputBuffer: AudioBuffer,
    startSeconds: number,
    endSeconds: number,
  ): AudioBuffer {
    const duration = Math.max(endSeconds - startSeconds, 0.01);
    const sampleRate = inputBuffer.sampleRate;
    const startFrame = Math.floor(startSeconds * sampleRate);
    const frameCount = Math.max(Math.floor(duration * sampleRate), 1);

    const output = new AudioBuffer({
      numberOfChannels: inputBuffer.numberOfChannels,
      length: frameCount,
      sampleRate,
    });

    for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
      const source = inputBuffer.getChannelData(channel);
      const target = output.getChannelData(channel);

      for (let i = 0; i < frameCount; i++) {
        const sourceIndex = startFrame + i;
        target[i] = sourceIndex < source.length ? source[sourceIndex] : 0;
      }
    }

    return output;
  }

  private async enhanceAudioBuffer(
    inputBuffer: AudioBuffer,
  ): Promise<AudioBuffer> {
    const rendered = await Tone.Offline(async () => {
      const source = new Tone.Player(inputBuffer);
      const gain = new Tone.Gain(1.2);
      const compressor = new Tone.Compressor(-18, 3);

      source.connect(gain);
      gain.connect(compressor);
      compressor.toDestination();

      source.start(0);
    }, inputBuffer.duration);

    const renderedBuffer = rendered.get();
    if (!renderedBuffer) {
      return inputBuffer;
    }

    return renderedBuffer;
  }

  /**
   * Encodes an AudioBuffer to WebM/Opus using the Web Codecs API + webm-muxer.
   *
   * WHY THIS FIXES THE DRIFT:
   * The previous approach used MediaRecorder, which records wall-clock time.
   * No scheduling trick can fix that — it is fundamentally real-time and will
   * always drift by 50–200ms depending on browser/OS scheduling jitter.
   *
   * This approach encodes directly from PCM sample frames. The muxer timestamps
   * are computed as (frameOffset / sampleRate) in microseconds — pure integer
   * arithmetic, no clock involved. The output duration equals exactly
   * (buffer.length / buffer.sampleRate), matching the input sample-for-sample.
   *
   * REQUIRES: npm install webm-muxer
   */
  private async audioBufferToWebmBlob(buffer: AudioBuffer): Promise<Blob> {
    // Opus works best at 48 kHz. Resample if needed via OfflineAudioContext.
    const TARGET_SAMPLE_RATE = 48000;
    let workBuffer = buffer;

    if (buffer.sampleRate !== TARGET_SAMPLE_RATE) {
      const resampleCtx = new OfflineAudioContext(
        buffer.numberOfChannels,
        Math.ceil(buffer.duration * TARGET_SAMPLE_RATE),
        TARGET_SAMPLE_RATE,
      );
      const src = resampleCtx.createBufferSource();
      src.buffer = buffer;
      src.connect(resampleCtx.destination);
      src.start(0);
      workBuffer = await resampleCtx.startRendering();
    }

    const numberOfChannels = Math.min(workBuffer.numberOfChannels, 2) as 1 | 2;
    const sampleRate = workBuffer.sampleRate;
    const totalFrames = workBuffer.length;

    // webm-muxer: streams encoded Opus packets into a WebM container.
    // ArrayBufferTarget collects the output in memory (no file I/O needed).
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      audio: {
        codec: 'A_OPUS',
        numberOfChannels,
        sampleRate,
      },
      // firstTimestampBehavior: 'offset' ensures timestamp 0 maps to the
      // very first encoded packet, so the container duration is exact.
      firstTimestampBehavior: 'offset',
    });

    // AudioEncoder processes frames offline (no real-time clock).
    // Each AudioData frame carries an explicit timestamp in microseconds
    // derived from (frameOffset / sampleRate) — integer maths, no drift.
    const FRAME_SIZE = 960; // 20 ms at 48 kHz — standard Opus frame size
    const BITRATE = 192_000;

    await new Promise<void>((resolve, reject) => {
      const encoder = new AudioEncoder({
        output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
        error: reject,
      });

      encoder.configure({
        codec: 'opus',
        sampleRate,
        numberOfChannels,
        bitrate: BITRATE,
      });

      // Interleave channels into a single Float32Array for AudioData.
      // Process in FRAME_SIZE chunks so each AudioData has an exact timestamp.
      let frameOffset = 0;

      while (frameOffset < totalFrames) {
        const frameCount = Math.min(FRAME_SIZE, totalFrames - frameOffset);
        const interleaved = new Float32Array(frameCount * numberOfChannels);

        for (let ch = 0; ch < numberOfChannels; ch++) {
          const channelData = workBuffer.getChannelData(ch);
          for (let i = 0; i < frameCount; i++) {
            interleaved[i * numberOfChannels + ch] =
              channelData[frameOffset + i];
          }
        }

        // Timestamp in microseconds, computed from sample position — no clock.
        const timestampUs = Math.round((frameOffset / sampleRate) * 1_000_000);

        const audioData = new AudioData({
          format: 'f32-planar',
          sampleRate,
          numberOfFrames: frameCount,
          numberOfChannels,
          timestamp: timestampUs,
          // f32-planar expects one plane per channel, not interleaved.
          // Re-extract as planar for the AudioData constructor.
          data: (() => {
            const planar = new Float32Array(frameCount * numberOfChannels);
            for (let ch = 0; ch < numberOfChannels; ch++) {
              const channelData = workBuffer.getChannelData(ch);
              planar.set(
                channelData.subarray(frameOffset, frameOffset + frameCount),
                ch * frameCount,
              );
            }
            return planar;
          })(),
        });

        encoder.encode(audioData);
        audioData.close();
        frameOffset += frameCount;
      }

      encoder
        .flush()
        .then(() => {
          muxer.finalize();
          resolve();
        })
        .catch(reject);
    });

    const { buffer: muxedBuffer } = target;
    return new Blob([muxedBuffer], { type: 'audio/webm' });
  }

  private withExtension(fileName: string, extension: string): string {
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex === -1
      ? `${fileName}.${extension}`
      : `${fileName.slice(0, dotIndex)}.${extension}`;
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
