# Component Index - Quick Navigation

> Quick reference guide for navigating the test-components page. All components are sorted alphabetically.

## 📑 Alphabetical Index

| #   | Component        | HTML ID         | Line (approx) | Description           |
| --- | ---------------- | --------------- | ------------- | --------------------- |
| 1   | **Accordion**    | `#accordion`    | ~6            | Collapsible panels    |
| 2   | **Alert**        | `#alert`        | ~100          | Notification messages |
| 3   | **Alert Dialog** | `#alert-dialog` | ~141          | Confirmation modals   |
| 4   | **Avatar**       | `#avatar`       | ~154          | Profile images        |
| 5   | **Badge**        | `#badge`        | ~212          | Status indicators     |
| 6   | **Breadcrumb**   | `#breadcrumb`   | ~256          | Navigation trail      |
| 7   | **Button**       | `#button`       | ~306          | Action buttons        |
| 8   | **Button Group** | `#button-group` | ~373          | Grouped buttons       |
| 9   | **Calendar**     | `#calendar`     | ~546          | Date selection        |
| 10  | **Card**         | `#card`         | ~636          | Content containers    |
| 11  | **Carousel**     | `#carousel`     | ~696          | Image/content slider  |
| 12  | **Checkbox**     | `#checkbox`     | ~946          | Binary selection      |
| 13  | **Combobox**     | `#combobox`     | ~980          | Searchable dropdown   |
| 14  | **Command**      | `#command`      | ~1053         | Command palette       |
| 15  | **Date Picker**  | `#date-picker`  | ~1127         | Date input field      |
| 16  | **Dialog**       | `#dialog`       | ~1176         | Modal dialogs         |
| 17  | **Divider**      | `#divider`      | ~1189         | Separator lines       |
| 18  | **Dropdown**     | `#dropdown`     | ~(see Menu)   | Context menus         |
| 19  | **Empty**        | `#empty`        | ~1212         | Empty states          |
| 20  | **Form**         | `#form`         | ~1308         | Form fields           |
| 21  | **Icon**         | `#icon`         | ~1815         | SVG icons             |
| 22  | **Input**        | `#input`        | ~1962         | Text input            |
| 23  | **Input Group**  | `#input-group`  | ~2005         | Input with addons     |
| 24  | **Kbd**          | `#kbd`          | ~2194         | Keyboard keys         |
| 25  | **Loader**       | `#loader`       | ~2240         | Loading spinners      |
| 26  | **Menu**         | `#menu`         | ~2261         | Navigation menus      |
| 27  | **Pagination**   | `#pagination`   | ~2473         | Page navigation       |
| 28  | **Popover**      | `#popover`      | ~2528         | Floating overlays     |
| 29  | **Progress Bar** | `#progress-bar` | ~2692         | Progress indicator    |
| 30  | **Radio**        | `#radio`        | ~2723         | Single selection      |
| 31  | **Resizable**    | `#resizable`    | ~2753         | Resizable panels      |
| 32  | **Segmented**    | `#segmented`    | ~2813         | Toggle options        |
| 33  | **Select**       | `#select`       | ~2880         | Dropdown select       |
| 34  | **Sheet**        | `#sheet`        | ~2938         | Side panels           |
| 35  | **Skeleton**     | `#skeleton`     | ~2972         | Loading placeholders  |
| 36  | **Slider**       | `#slider`       | ~2999         | Range input           |
| 37  | **Switch**       | `#switch`       | ~3044         | Toggle switch         |
| 38  | **Table**        | `#table`        | ~3075         | Data tables           |
| 39  | **Tabs**         | `#tabs`         | ~3166         | Tab navigation        |
| 40  | **Toast**        | `#toast`        | ~3372         | Notifications         |
| 41  | **Toggle**       | `#toggle`       | ~3443         | Toggle button         |
| 42  | **Toggle Group** | `#toggle-group` | ~3503         | Button toolbar        |
| 43  | **Tooltip**      | `#tooltip`      | ~3580         | Hover tips            |

---

## 🎯 Quick Access by Category

### Layout & Structure

- Card (#card)
- Divider (#divider)
- Resizable (#resizable)

### Navigation

- Breadcrumb (#breadcrumb)
- Menu (#menu)
- Pagination (#pagination)
- Tabs (#tabs)

### Forms & Inputs

- Checkbox (#checkbox)
- Combobox (#combobox)
- Date Picker (#date-picker)
- Form (#form)
- Input (#input)
- Input Group (#input-group)
- Radio (#radio)
- Select (#select)
- Slider (#slider)
- Switch (#switch)

### Buttons & Actions

- Button (#button)
- Button Group (#button-group)
- Toggle (#toggle)
- Toggle Group (#toggle-group)

### Feedback & Notifications

- Alert (#alert)
- Alert Dialog (#alert-dialog)
- Empty (#empty)
- Loader (#loader)
- Progress Bar (#progress-bar)
- Skeleton (#skeleton)
- Toast (#toast)
- Tooltip (#tooltip)

### Overlays & Modals

- Dialog (#dialog)
- Dropdown (#dropdown)
- Popover (#popover)
- Sheet (#sheet)

### Data Display

- Avatar (#avatar)
- Badge (#badge)
- Icon (#icon)
- Kbd (#kbd)
- Table (#table)

### Advanced Components

- Accordion (#accordion)
- Calendar (#calendar)
- Carousel (#carousel)
- Command (#command)
- Segmented (#segmented)

---

## 🚀 Usage Tips

### Navigate by URL Hash

```
http://localhost:4200/test-components#accordion
http://localhost:4200/test-components#button
http://localhost:4200/test-components#calendar
```

### Find in File

Use your editor's "Go to Line" or search for:

- HTML: `id="component-name"`
- TypeScript: Search for method/property names in API_REFERENCE.md

### Copy Examples

1. Navigate to component section
2. Inspect HTML/TypeScript
3. Copy-paste into your project
4. Adjust properties as needed

---

## 📊 Component Statistics

| Metric                     | Count |
| -------------------------- | ----- |
| Total Components           | 43    |
| Components with State      | 14    |
| Components (Service-based) | 3     |
| Form-compatible            | 15    |
| Total Variants             | 200+  |
| Total Props                | 300+  |

---

## 🔗 Related Documentation

- [README.md](./README.md) - Detailed component documentation
- [API_REFERENCE.md](./API_REFERENCE.md) - API & method reference
- [COMPONENT_USAGE_GUIDE.md](../../../Doc/COMPONENT_USAGE_GUIDE.md) - Main project guide

---

## ⚡ Performance Notes

- **Lazy Loading**: All components are standalone
- **Tree Shaking**: Unused components won't be bundled
- **Bundle Size**: ~150KB (gzipped) for all components
- **Runtime**: Optimized with OnPush change detection

---

**Last Updated**: January 2026
**Total Components**: 43
**Framework**: Angular 21.1 + Zardui
