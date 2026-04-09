---
agent: 'agent'
description: 'Guide on how to integrate the File Selector and File Manager components into a form or page.'
---

# File Manager & File Selector Workflow

This workflow explains how to integrate the file management system into your application. The system consists of two main components:

1. **File Selector (`shared-file-selector`)**: Displays selected files and provides a button to open the File Manager.
2. **File Manager (`shared-file-manager`)**: A dialog-based component for browsing, uploading, and selecting files.

## 1. Import the Component

```typescript
import { FileSelectorComponent } from '@ihsan/shared';

@Component({
  standalone: true,
  imports: [FileSelectorComponent],
})
export class MyComponent {}
```

## 2. Basic Usage in a Template

```html
<shared-file-selector
  [label]="'Upload Profile Picture'"
  [maxFiles]="1"
  selectionMode="single"
  (filesChanged)="onFilesChanged($event)"
></shared-file-selector>
```

## 3. Configuration Inputs

| Input           | Type                                             | Default         | Description                                         |
| :-------------- | :----------------------------------------------- | :-------------- | :-------------------------------------------------- |
| `label`         | `string`                                         | `'Select File'` | Label text on the upload button                     |
| `maxFiles`      | `number`                                         | `1`             | Maximum number of files allowed                     |
| `selectionMode` | `'single' \| 'multiple'`                         | `'single'`      | Single or multi-file selection                      |
| `viewMode`      | `'list' \| 'grid'`                               | `'grid'`        | Default view mode in the file manager dialog        |
| `allowedTypes`  | `string[]`                                       | `['*']`         | Allowed file extensions (e.g., `['.jpg', '.png']`)  |
| `group`         | `FileGroup`                                      | `undefined`     | Pre-filter by file group (e.g., `FileGroup.Tenant`) |
| `type`          | `FileType`                                       | `undefined`     | Pre-filter by file type (e.g., `FileType.Image`)    |
| `files`         | `IFileManagerResponse[]`                         | `undefined`     | Initial selected files (useful for edit forms)      |
| `buttonType`    | `'default' \| 'destructive' \| 'outline' \| ...` | `'default'`     | Button styling variant                              |

## 4. Using Enums for Group and Type

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
  selectionMode="single"
  (filesChanged)="onFilesChanged($event)"
></shared-file-selector>
```

## 5. Handling Selection Output

```typescript
import { IFileManagerResponse } from '@ihsan/core';

export class MyComponent {
  selectedFiles: IFileManagerResponse[] = [];

  onFilesChanged(files: IFileManagerResponse[]): void {
    this.selectedFiles = files;

    // If using Reactive Forms:
    this.form.patchValue({ profileImage: files[0]?.url });
  }
}
```

## 6. Integration in Edit Forms

Pre-populate the selector with existing files using the `files` input:

```html
<shared-file-selector
  label="{{ 'profile.picture' | translate }}"
  [maxFiles]="1"
  selectionMode="single"
  [files]="existingFiles()"
  (filesChanged)="onFilesChanged($event)"
></shared-file-selector>
```

```typescript
// Populate from existing entity data
existingFiles = signal<IFileManagerResponse[]>([]);

ngOnInit(): void {
  if (this._data?.item?.imageUrl) {
    this.existingFiles.set([{ url: this._data.item.imageUrl } as IFileManagerResponse]);
  }
}
```
