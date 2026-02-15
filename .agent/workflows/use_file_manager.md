---
description: Guide on how to use the File Selector and File Manager components
---

# File Manager & Selector Workflow

This workflow explains how to integrate the file management system into your application. The system consists of two main components:

1. **File Selector (`shared-file-selector`)**: A UI component that displays selected files and provides a button to open the File Manager.
2. **File Manager (`shared-file-manager`)**: A dialog-based component for browsing, uploading, and selecting files.

## 1. Import the Component

Import `FileSelectorComponent` in your standalone component or module.

```typescript
import { FileSelectorComponent } from '@ihsan/shared'; // Adjust import path as needed
// OR relative path if not exported from barrel
// import { FileSelectorComponent } from '../../../../libs/shared/src/lib/components/file-selector/file-selector.component';

@Component({
  // ...
  imports: [FileSelectorComponent],
  // ...
})
export class MyComponent {}
```

## 2. Basic Usage within a Form/Template

Use the `<shared-file-selector>` tag in your HTML.

```html
<shared-file-selector
  [label]="'Upload Profile Picture'"
  [maxFiles]="1"
  selectionMode="single"
  (filesChanged)="onFilesChanged($event)"
></shared-file-selector>
```

## 3. Configuration Inputs

The `FileSelectorComponent` accepts the following inputs:

| Input           | Type                                             | Default         | Description                                                           |
| :-------------- | :----------------------------------------------- | :-------------- | :-------------------------------------------------------------------- |
| `label`         | `string`                                         | `'Select File'` | The label text displayed on the upload button.                        |
| `maxFiles`      | `number`                                         | `1`             | Maximum number of files allowed to be selected.                       |
| `selectionMode` | `'single' \| 'multiple'`                         | `'single'`      | Determines if one or multiple files can be picked.                    |
| `viewMode`      | `'list' \| 'grid'`                               | `'grid'`        | Default view mode for the file manager dialog.                        |
| `allowedTypes`  | `string[]`                                       | `['*']`         | Array of allowed file extensions (e.g., `['.jpg', '.png']`).          |
| `group`         | `FileGroup`                                      | `undefined`     | Pre-filter the file manager by file group (e.g., `FileGroup.Tenant`). |
| `type`          | `FileType`                                       | `undefined`     | Pre-filter the file manager by file type (e.g., `FileType.Image`).    |
| `files`         | `IFileManagerResponse[]`                         | `undefined`     | Initial list of selected files (useful for edit forms).               |
| `buttonType`    | `'default' \| 'destructive' \| 'outline' \| ...` | `'default'`     | Styling variant for the button.                                       |

### Using Enums for Group and Type

You can import `FileGroup` and `FileType` from `@ihsan/core` to use strict typing for filters.

```typescript
import { FileGroup, FileType } from '@ihsan/core';

@Component({ ... })
export class MyComponent {
  myFileGroup = FileGroup.Tenant;
  myFileType = FileType.Image;
}
```

```html
<shared-file-selector
  [group]="myFileGroup"
  [type]="myFileType"
  ...
></shared-file-selector>
```

## 4. Handling Selection Output

The component emits a `filesChanged` event whenever the selection changes (add, remove, reorder).

```typescript
import { IFileManagerResponse } from '@ihsan/core';

// ... class
selectedFiles: IFileManagerResponse[] = [];

onFilesChanged(files: IFileManagerResponse[]) {
  this.selectedFiles = files;
  console.log('Current selection:', this.selectedFiles);

  // If using Reactive Forms:
  // this.form.patchValue({ profileImage: files[0]?.url });
}
```

## 5. Programmatic Usage (Advanced)

If you need to open the File Manager dialog directly without using the selector button (e.g., from a custom action), you can use `ZardDialogService`.

```typescript
import { ZardDialogService } from '@ihsan/ui';
import { FileManagerComponent } from '@ihsan/shared'; // Adjust path
import { IFileManagerDialogData } from './path/to/file-manager.component';

export class MyComponent {
  private _dialog = inject(ZardDialogService);

  openFileManager() {
    const data: IFileManagerDialogData = {
      maxFiles: 5,
      selectionMode: 'multiple',
      // ... other options
    };

    const dialogRef = this._dialog.create({
      zContent: FileManagerComponent,
      zData: data,
      zWidth: '80vw',
      zCustomClasses: 'z-dialog-max-width-100',
      zHideFooter: true,
    });

    dialogRef.afterClosed().subscribe((files) => {
      if (files) {
        console.log('User selected:', files);
      }
    });
  }
}
```

## 6. Drag and Drop Support

The `FileSelectorComponent` supports drag-and-drop reordering when `selectionMode="multiple"`. This is handled automatically by the component.
