# Zardui Component Usage Guide

## 🎯 Purpose

This guide helps AI assistants and developers select the correct Zardui component for specific UI tasks. **ALWAYS consult this guide before creating custom UI components.**

## 🚨 Golden Rule: Zardui First

**Before creating ANY custom UI component, check if Zardui provides it.** All components listed below are already installed and ready to use via `@ngzard/ui`.

---

## 📑 Component Reference

### Accordion

**When to use:**

- Displaying collapsible sections of content (FAQ, settings panels, expandable lists)
- Organizing related information that users can show/hide
- Saving vertical space while keeping content accessible

**Common use cases:**

- FAQ sections
- Settings panels with multiple categories
- Product details with expandable specifications
- Help documentation with collapsible topics

**Import from:** `@ngzard/ui/accordion`

---

### Alert

**When to use:**

- Displaying inline notifications or messages
- Showing status updates (success, warning, error, info)
- Presenting important information that doesn't require user action

**Common use cases:**

- Form submission success/error messages
- Warning banners (maintenance notice, beta features)
- Information callouts in documentation
- Status indicators (account verification pending)

**NOT for:** Modal dialogs requiring user action (use Alert Dialog instead)

**Import from:** `@ngzard/ui/alert`

---

### Alert Dialog

**When to use:**

- Requiring user confirmation before destructive actions
- Displaying critical warnings that demand attention
- Showing blocking messages that require acknowledgment

**Common use cases:**

- Delete confirmations ("Are you sure you want to delete this item?")
- Logout confirmations
- Unsaved changes warnings
- Critical error notifications requiring acknowledgment

**NOT for:** Non-blocking notifications (use Toast instead) or informational dialogs (use Dialog)

**Import from:** `@ngzard/ui/alert-dialog`

---

### Avatar

**When to use:**

- Displaying user profile pictures
- Showing user initials when no image available
- Representing users in lists, comments, or chat interfaces

**Common use cases:**

- User profile headers
- Comment sections (user avatars next to comments)
- Team member lists
- Chat message senders
- Navigation bar user menu

**Import from:** `@ngzard/ui/avatar`

---

### Badge

**When to use:**

- Showing counts or status indicators
- Highlighting new, updated, or unread items
- Displaying small pieces of metadata (tags, labels)

**Common use cases:**

- Notification counters (3 unread messages)
- Status labels (Active, Pending, Approved)
- Version tags (v2.0, Beta)
- Category tags on blog posts
- Shopping cart item count

**Import from:** `@ngzard/ui/badge`

---

### Breadcrumb

**When to use:**

- Showing the user's current location in a hierarchical structure
- Providing navigation back to parent pages
- Displaying multi-level navigation paths

**Common use cases:**

- Multi-level page navigation (Home > Products > Electronics > Laptops)
- File/folder navigation
- E-commerce category paths
- Documentation section navigation

**Import from:** `@ngzard/ui/breadcrumb`

---

### Button

**When to use:**

- Triggering actions (submit, save, delete, etc.)
- Navigation to other pages
- Opening dialogs or menus

**Common use cases:**

- Form submissions
- Primary/secondary actions in dialogs
- Call-to-action buttons
- Icon buttons for toolbars
- Link-styled buttons

**Variants:** Primary, secondary, outline, ghost, destructive, link

**NOT for:** Navigation links in text (use anchor tags)

**Import from:** `@ngzard/ui/button`

---

### Button Group

**When to use:**

- Grouping related buttons together
- Creating segmented controls
- Toolbar actions that belong together

**Common use cases:**

- Text formatting toolbars (Bold, Italic, Underline)
- View switchers (Grid view, List view)
- Pagination controls (Previous, 1, 2, 3, Next)
- Action groups (Edit, Delete, Share)

**Import from:** `@ngzard/ui/button-group`

---

### Calendar

**When to use:**

- Selecting dates or date ranges
- Displaying events on specific dates
- Building custom date pickers

**Common use cases:**

- Booking systems (select check-in/check-out dates)
- Event calendars
- Date range selectors for reports
- Scheduling interfaces

**NOT for:** Simple date input (use Date Picker instead)

**Import from:** `@ngzard/ui/calendar`

---

### Card

**When to use:**

- Grouping related content in a container
- Displaying summary information with actions
- Creating grid layouts of items (products, users, articles)

**Common use cases:**

- Product cards in e-commerce
- User profile cards
- Dashboard widgets
- Blog post previews
- Pricing plan cards

**Import from:** `@ngzard/ui/card`

---

### Carousel

**When to use:**

- Displaying multiple items in a scrollable slideshow
- Showing image galleries
- Presenting testimonials or featured content

**Common use cases:**

- Hero section image sliders
- Product image galleries
- Testimonial rotators
- Featured content showcases
- Tutorial step walkthroughs

**Import from:** `@ngzard/ui/carousel`

---

### Checkbox

**When to use:**

- Toggling individual options on/off
- Selecting multiple items from a list
- Accepting terms and conditions

**Common use cases:**

- Multi-select lists (select multiple users, items)
- Filter options (show only active items)
- Settings toggles (enable notifications)
- Agreement checkboxes (I accept terms and conditions)

**NOT for:** Mutually exclusive options (use Radio instead)

**Import from:** `@ngzard/ui/checkbox`

---

### Combobox

**When to use:**

- Combining dropdown selection with text input
- Filtering large lists while typing
- Autocomplete functionality

**Common use cases:**

- Country/city selectors with search
- Tag input with suggestions
- Autocomplete search fields
- Searchable dropdown menus

**Import from:** `@ngzard/ui/combobox`

---

### Command

**When to use:**

- Creating command palettes (keyboard-driven interfaces)
- Building searchable action menus
- Implementing quick-access commands

**Common use cases:**

- Application command palette (Ctrl+K)
- Search with actions (search users, then select action)
- Keyboard-driven navigation menus

**Import from:** `@ngzard/ui/command`

---

### Date Picker

**When to use:**

- Selecting a single date from a calendar
- Date input fields in forms

**Common use cases:**

- Birthdate selection
- Appointment booking
- Event date selection
- Deadline pickers in task management

**NOT for:** Date range selection (use Calendar with range mode)

**Import from:** `@ngzard/ui/date-picker`

---

### Dialog

**When to use:**

- Displaying content in a modal overlay
- Forms that require user input
- Detailed views that don't need a separate page

**Common use cases:**

- Edit user dialogs
- Create new item forms
- Image lightboxes
- Video players
- Multi-step wizards

**NOT for:** Critical confirmations (use Alert Dialog)

**Import from:** `@ngzard/ui/dialog`

---

### Divider

**When to use:**

- Separating content sections
- Creating visual breaks between groups
- Organizing menu items

**Common use cases:**

- Separating form sections
- Dividing menu groups
- Visual breaks in card content
- Footer section separators

**Import from:** `@ngzard/ui/divider`

---

### Dropdown

**When to use:**

- Creating context menus
- User account menus
- Action menus (more options, kebab menus)

**Common use cases:**

- User profile dropdown (Settings, Logout)
- Row action menus in tables (Edit, Delete, Share)
- More options menus
- Context menus on right-click

**NOT for:** Form select inputs (use Select instead)

**Import from:** `@ngzard/ui/dropdown`

---

### Empty

**When to use:**

- Displaying empty states
- Showing "no data" messages with call-to-action
- Placeholder content when lists are empty

**Common use cases:**

- Empty inbox ("No messages yet")
- Empty search results
- Empty shopping cart
- No items in list views

**Import from:** `@ngzard/ui/empty`

---

### Form

**When to use:**

- Building reactive forms with validation
- Creating form layouts with labels and error messages
- Integrating with Angular FormControl/FormGroup

**Common use cases:**

- User registration forms
- Login forms
- Settings pages
- Data entry forms
- Multi-field input forms

**Import from:** `@ngzard/ui/form`

---

### Icon

**When to use:**

- Displaying SVG icons
- Adding visual indicators to buttons, menus, etc.
- Icon-only buttons or navigation

**Common use cases:**

- Button icons (Save icon on save button)
- Navigation menu icons
- Status indicators
- Social media icons

**Import from:** `@ngzard/ui/icon`

---

### Input

**When to use:**

- Single-line text input
- Email, password, number inputs
- Form fields requiring user text entry

**Common use cases:**

- Email address input
- Password fields
- Name/username fields
- Search boxes
- Number inputs

**NOT for:** Multi-line text (use textarea) or file uploads (use file input)

**Import from:** `@ngzard/ui/input`

---

### Input Group

**When to use:**

- Adding prefixes/suffixes to inputs (icons, text)
- Combining input with buttons
- Creating composite input components

**Common use cases:**

- Currency inputs ($ prefix)
- Search input with search button
- URL inputs (https:// prefix)
- Phone number inputs (country code prefix)

**Import from:** `@ngzard/ui/input-group`

---

### Kbd

**When to use:**

- Displaying keyboard shortcuts
- Showing key combinations in documentation

**Common use cases:**

- Shortcut hints (Press Ctrl+S to save)
- Keyboard command documentation
- Help tooltips with shortcuts

**Import from:** `@ngzard/ui/kbd`

---

### Layout

**When to use:**

- Creating application shells (header, sidebar, content, footer)
- Building responsive page layouts
- Organizing page structure

**Common use cases:**

- Admin dashboard layouts
- Application shell with navigation
- Multi-column layouts
- Responsive page structures

**Import from:** `@ngzard/ui/layout`

---

### Loader

**When to use:**

- Indicating loading states
- Showing async operation progress
- Skeleton loaders for content placeholders

**Common use cases:**

- Page loading indicators
- Button loading states (submitting form)
- Lazy-loaded content placeholders
- Data fetching indicators

**Import from:** `@ngzard/ui/loader`

---

### Menu

**When to use:**

- Creating navigation menus
- Building sidebar menus
- Multi-level menu structures

**Common use cases:**

- Application navigation sidebar
- Nested menu items
- Settings menu with submenus
- Mobile navigation menus

**NOT for:** Dropdown action menus (use Dropdown instead)

**Import from:** `@ngzard/ui/menu`

---

### Pagination

**When to use:**

- Navigating through paginated data
- Splitting large datasets into pages
- Table navigation

**Common use cases:**

- Table pagination (showing 1-10 of 100)
- Search results pagination
- Product listing pages
- Blog post archives

**Import from:** `@ngzard/ui/pagination`

---

### Popover

**When to use:**

- Displaying additional information on hover/click
- Creating floating panels with rich content
- Contextual help or tooltips with interactive content

**Common use cases:**

- User profile previews on hover
- Color picker panels
- Rich tooltips with links/buttons
- Contextual help panels

**NOT for:** Simple text tooltips (use Tooltip instead)

**Import from:** `@ngzard/ui/popover`

---

### Progress Bar

**When to use:**

- Showing progress of long-running operations
- Displaying completion percentage
- Multi-step process indicators

**Common use cases:**

- File upload progress
- Form completion progress
- Multi-step wizard progress
- Loading progress (determinate)

**Import from:** `@ngzard/ui/progress-bar`

---

### Radio

**When to use:**

- Selecting one option from multiple choices
- Mutually exclusive options

**Common use cases:**

- Gender selection (Male, Female, Other)
- Payment method selection
- Shipping method selection
- Single-choice question answers

**NOT for:** Multiple selections (use Checkbox instead)

**Import from:** `@ngzard/ui/radio`

---

### Resizable

**When to use:**

- Creating panels that users can resize
- Split view layouts
- Adjustable sidebar widths

**Common use cases:**

- Code editor split views
- Resizable sidebar panels
- Multi-pane layouts (file tree + editor + preview)

**Import from:** `@ngzard/ui/resizable`

---

### Segmented

**When to use:**

- Creating segmented controls (toggle between views)
- Mutually exclusive button groups
- View switchers

**Common use cases:**

- Map/Satellite view toggle
- Grid/List view switcher
- Time period selectors (Day, Week, Month)
- Chart type selectors

**Import from:** `@ngzard/ui/segmented`

---

### Select

**When to use:**

- Dropdown selection from a list of options
- Form select inputs
- Single or multi-select from predefined options

**Common use cases:**

- Country/state selection
- Category selection
- Role assignment dropdowns
- Language selection

**NOT for:** Action menus (use Dropdown instead)

**Import from:** `@ngzard/ui/select`

---

### Sheet

**When to use:**

- Sliding panels from screen edges
- Mobile-friendly dialogs
- Side panels with content

**Common use cases:**

- Mobile navigation drawers
- Filters panel (slide from left)
- Shopping cart drawer (slide from right)
- Notification panels

**NOT for:** Centered modals (use Dialog instead)

**Import from:** `@ngzard/ui/sheet`

---

### Skeleton

**When to use:**

- Loading placeholders that match content layout
- Improving perceived performance during loading
- Content placeholders before data loads

**Common use cases:**

- Loading user profile placeholders
- Table row loading states
- Card content loading
- List item placeholders

**Import from:** `@ngzard/ui/skeleton`

---

### Slider

**When to use:**

- Selecting numeric values from a range
- Volume controls
- Price range filters

**Common use cases:**

- Price range selectors (min-max)
- Volume/brightness controls
- Rating inputs
- Percentage selectors

**Import from:** `@ngzard/ui/slider`

---

### Switch

**When to use:**

- On/off toggles (binary states)
- Enabling/disabling features
- Settings toggles

**Common use cases:**

- Dark mode toggle
- Enable notifications toggle
- Feature flags (enable/disable)
- Privacy settings (public/private)

**NOT for:** Multiple checkboxes (use Checkbox instead)

**Import from:** `@ngzard/ui/switch`

---

### Table

**When to use:**

- Displaying tabular data
- Data grids with sorting/filtering
- Lists with multiple columns

**Common use cases:**

- User management tables
- Product listings
- Invoice tables
- Report data grids
- Transaction history

**Import from:** `@ngzard/ui/table`

---

### Tabs

**When to use:**

- Organizing content into multiple sections
- Switching between related views
- Multi-panel interfaces

**Common use cases:**

- Settings pages (Profile, Security, Notifications)
- Product details (Overview, Specs, Reviews)
- Dashboard sections
- Form wizards with named steps

**Import from:** `@ngzard/ui/tabs`

---

### Toast

**When to use:**

- Temporary, non-blocking notifications
- Success/error messages after actions
- Auto-dismissing alerts

**Common use cases:**

- "Saved successfully" notifications
- Copy to clipboard confirmations
- Background task completions
- Error notifications (non-critical)

**NOT for:** Critical errors requiring action (use Alert Dialog)

**Import from:** `@ngzard/ui/toast`

---

### Toggle

**When to use:**

- Binary state buttons (pressed/unpressed)
- Toolbar toggle buttons (bold, italic)
- Single toggle button states

**Common use cases:**

- Text formatting toggles (bold, italic, underline)
- Favorite/unfavorite buttons
- Bookmark toggles
- Play/pause buttons

**Import from:** `@ngzard/ui/toggle`

---

### Toggle Group

**When to use:**

- Multiple toggle buttons where one or more can be active
- Toolbar with multiple toggle options
- Filter toggles (multiple active states)

**Common use cases:**

- Text alignment (left, center, right, justify)
- Font style toggles (bold, italic, underline)
- View filters (active, archived, deleted)

**Import from:** `@ngzard/ui/toggle-group`

---

### Tooltip

**When to use:**

- Displaying short, simple hints on hover
- Explaining icon-only buttons
- Showing additional context for UI elements

**Common use cases:**

- Icon button explanations
- Abbreviated text full versions
- Input field hints
- Help text on hover

**NOT for:** Rich content with links/buttons (use Popover instead)

**Import from:** `@ngzard/ui/tooltip`

---

## 🔍 Decision Tree

**Need to...**

- **Collect user input?**

  - Text → Input
  - Date → Date Picker
  - Select from list → Select
  - Multiple options → Checkbox
  - Single choice → Radio
  - On/off toggle → Switch
  - Numeric range → Slider

- **Display information?**

  - Tabular data → Table
  - Cards/grid → Card
  - Empty state → Empty
  - Loading → Loader/Skeleton
  - Status/count → Badge
  - User picture → Avatar

- **Organize content?**

  - Collapsible sections → Accordion
  - Multiple views → Tabs
  - Split layout → Resizable
  - Sections → Divider

- **Navigate?**

  - Page navigation → Breadcrumb
  - Sidebar menu → Menu
  - Paginated data → Pagination

- **Show notifications?**

  - Temporary → Toast
  - Inline message → Alert
  - Critical warning → Alert Dialog

- **Create overlays?**

  - General modal → Dialog
  - Confirmation → Alert Dialog
  - Side panel → Sheet
  - Context menu → Dropdown
  - Hover info → Tooltip/Popover

- **Trigger actions?**
  - Single action → Button
  - Multiple actions → Dropdown
  - Grouped actions → Button Group
  - Toggle state → Toggle/Toggle Group

---

## ⚠️ Anti-Patterns

**NEVER create custom components for:**

- ❌ Custom buttons (use Button with variants)
- ❌ Custom inputs (use Input/Input Group)
- ❌ Custom dialogs (use Dialog/Alert Dialog/Sheet)
- ❌ Custom dropdowns (use Dropdown/Select)
- ❌ Custom menus (use Menu/Dropdown)
- ❌ Custom cards (use Card)
- ❌ Custom badges (use Badge)
- ❌ Custom alerts (use Alert/Toast)
- ❌ Custom loading spinners (use Loader)
- ❌ Custom tooltips (use Tooltip/Popover)

**When to create custom components:**

- ✅ Business-specific layouts (user-profile-card, dashboard-widget)
- ✅ Composite components combining multiple Zardui components
- ✅ Domain-specific visualizations (charts, graphs)
- ✅ Complex business logic components (multi-step forms with custom validation)

---

## 📚 Additional Resources

- **Zardui Documentation**: [https://zardui.vercel.app](https://zardui.vercel.app)
- **Installation**: Run `install-zardui-components.bat` for new components
- **Local Wrapper**: Import from `@ngzard/ui` (configured in workspace)
- **Package Import**: Import from `@zardui/angular` (direct package access)

---

**Last Updated:** January 18, 2026
