---
name: fe-use-file-manager
description: Integrate the shared File Selector and File Manager dialog into an Angular form or page — imports, configuration inputs, FileGroup/FileType enums, filesChanged output handling, and edit-form pre-population. Use this whenever the user asks to add file upload, integrate file selection, allow image picking, attach files to a form, use the file manager, or pre-populate files in an edit form.
---

# File Manager & File Selector Workflow

Two components:
1. **`shared-file-selector`**: Displays selected files and opens the File Manager dialog
2. **`shared-file-manager`**: Dialog for browsing, uploading, and selecting files

## 1. Import

```typescript
import { FileSelectorComponent } from '@ihsan/shared';

@Component({
  standalone: true,
  imports: [FileSelectorComponent],
})
export class MyComponent {}
```

## 2. Basic Usage

```html
<shared-file-selector
  [label]="'Upload Profile Picture'"
  [maxFiles]="1"
  selectionMode="single"
  (filesChanged)="onFilesChanged($event)"
/>
```

## 3. Configuration Inputs

All inputs use Angular's `input()` signal function (not `@Input()` decorator).

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `'Select File'` | Label text on the upload button |
| `maxFiles` | `number` | `1` | Maximum number of files allowed |
| `selectionMode` | `'single' \| 'multiple'` | `'single'` | Single or multi-file selection |
| `viewMode` | `'list' \| 'grid' \| 'badge'` | `'grid'` | Default view mode in the dialog (`'badge'` shows files as inline badges) |
| `allowedTypes` | `string[]` | `['*']` | Allowed types (e.g. `['image/*']`) |
| `group` | `FileGroup` | `undefined` | Pre-filter by file group |
| `type` | `FileType` | `undefined` | Pre-filter by file type |
| `files` | `IFileManagerResponse[] \| null \| undefined` | `undefined` | Initial selected files (for edit forms) |
| `allowSubmitEmpty` | `boolean` | `false` | Allow submitting with no files selected |
| `buttonType` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | `'default'` | Button styling variant |

> **Note:** `filesChanged` is a legacy `@Output() EventEmitter` (not a signal output). Bind it with `(filesChanged)="handler($event)"` as normal.

## 4. Using Enums for Group and Type

```typescript
import { FileGroup, FileType } from '@ihsan/core';

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
/>
```

## 5. Handling Selection Output

```typescript
import { IFileManagerResponse } from '@ihsan/core';

export class MyComponent {
  onFilesChanged(files: IFileManagerResponse[]): void {
    // If using Reactive Forms:
    this.form.patchValue({ profileImage: files[0]?.url });
  }
}
```

## 6. Pre-populate for Edit Forms

```html
<shared-file-selector
  [label]="'profile.picture' | translate"
  [maxFiles]="1"
  selectionMode="single"
  [files]="existingFiles()"
  (filesChanged)="onFilesChanged($event)"
/>
```

```typescript
existingFiles = signal<IFileManagerResponse[]>([]);

ngOnInit(): void {
  if (this._data?.item?.imageUrl) {
    this.existingFiles.set([{ url: this._data.item.imageUrl } as IFileManagerResponse]);
  }
}
```
