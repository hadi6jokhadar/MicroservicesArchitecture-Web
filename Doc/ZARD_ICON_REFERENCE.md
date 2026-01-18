# ZardIcon Reference Guide

## Overview

`ZardIcon` is the type used throughout the application for all icon references. It's based on Lucide Icons and provides a curated set of icons available in the design system.

## Available Icons

All icons are imported from `@ihsan/ui` and must use one of the valid icon names listed below.

### Navigation & UI Icons

- `panel-left` - Sidebar panel icon
- `chevron-down` - Collapse down indicator
- `chevron-up` - Collapse up indicator
- `chevron-left` - Navigate left
- `chevron-right` - Navigate right
- `chevrons-up-down` - Expand/collapse toggle
- `move-right` - Forward/next action
- `arrow-right` - Right arrow
- `arrow-left` - Left arrow
- `arrow-up` - Up arrow
- `arrow-up-right` - Diagonal up-right arrow
- `ellipsis` - More options menu

### User & Account Icons

- `user` - Single user
- `users` - Multiple users/group
- `log-out` - Logout action
- `shield` - Security/permissions
- `badge-check` - Verified/approved status

### Navigation & Structure

- `house` - Home/dashboard
- `inbox` - Inbox/messages
- `calendar` - Calendar/dates
- `clock` - Time/schedule
- `calendar-plus` - Add event
- `settings` - Settings/configuration

### File Management

- `folder` - Folder/directory
- `folder-open` - Opened folder
- `folder-plus` - Add folder
- `folder-code` - Code folder
- `file` - Generic file
- `file-text` - Text/document file
- `archive` - Archive/compressed file
- `clipboard` - Copy/clipboard

### Search & Input

- `search` - Search functionality
- `mail` - Email/messages
- `bell` - Notifications
- `info` - Information/help

### Content & Formatting

- `bold` - Bold text formatting
- `italic` - Italic text formatting
- `underline` - Underline text formatting
- `text-align-center` - Center alignment
- `text-align-start` - Start/left alignment
- `text-align-end` - End/right alignment
- `code` - Code/programming
- `code-xml` - XML/markup code

### Status & Indicators

- `check` - Success/checked
- `x` - Close/cancel
- `circle` - Neutral indicator
- `circle-check` - Success indicator
- `circle-alert` - Warning/alert indicator
- `circle-x` - Error/failure indicator
- `circle-small` - Small circle indicator
- `circle-dollar-sign` - Price/payment indicator
- `triangle-alert` - Warning/caution
- `ban` - Blocked/prohibited

### Library & Learning

- `book-open` - Open book/reading
- `book-open-text` - Book with text
- `square-library` - Library/collection
- `layers` - Layers/stacking
- `layers-2` - Multiple layers
- `puzzle` - Puzzle/extension

### Devices & Display

- `monitor` - Desktop/computer
- `smartphone` - Mobile device
- `tablet` - Tablet device
- `terminal` - Terminal/console

### Development & Tools

- `save` - Save action
- `copy` - Copy action
- `trash` - Delete action
- `plus` - Add/create action
- `minus` - Remove/subtract action
- `eye` - View/visibility
- `loader-circle` - Loading spinner

### Theme & Appearance

- `sun` - Light mode
- `moon` - Dark mode
- `lightbulb` - Ideas/tips
- `lightbulb-off` - Dark mode/off
- `palette` - Color/theme customization
- `sparkles` - Premium/special feature

### Organization & Metadata

- `tag` - Tags/labels
- `list-filter-plus` - Filters/advanced options
- `layout-dashboard` - Dashboard view

### Utility Icons

- `heart` - Favorites/likes
- `star` - Rating/favorites
- `zap` - Power/energy/speed
- `popcorn` - Entertainment/fun

## Usage Examples

### In Sidebar Component

```typescript
import { ZardIcon } from '@ihsan/ui';
import { SidebarPageClass } from '@ihsan/shared';

const pages = [
  new SidebarPageClass({
    label: 'Dashboard',
    icon: 'layout-dashboard' as ZardIcon,
    route: '/dashboard',
  }),
  new SidebarPageClass({
    label: 'Identity',
    icon: 'shield' as ZardIcon,
    children: [
      new SidebarPageClass({
        label: 'Users',
        icon: 'users' as ZardIcon,
        route: '/identity/users',
      }),
      new SidebarPageClass({
        label: 'Roles',
        icon: 'badge-check' as ZardIcon,
        route: '/identity/roles',
      }),
    ],
  }),
];
```

### In Custom Components

```typescript
import { ZardIconComponent } from '@ihsan/ui';

@Component({
  selector: 'app-custom',
  imports: [ZardIconComponent],
  template: `<i z-icon zType="shield"></i>`,
})
export class CustomComponent {}
```

## Important Notes

- ✅ Always use valid icon names from the list above
- ✅ Icons must be cast `as ZardIcon` for TypeScript type safety
- ❌ Do NOT use icon names that are not in the available list
- ❌ Icon names are case-sensitive (use kebab-case like `layout-dashboard`)
- ✅ Use descriptive icon names that match the semantic meaning of the action/feature

## Icon Updates

If you need an icon that's not currently available:

1. Check if an alternative icon from the list would work semantically
2. Request addition of the new icon to the Zardui component library
3. Update this document once the icon is added

---

**Last Updated:** January 18, 2026
