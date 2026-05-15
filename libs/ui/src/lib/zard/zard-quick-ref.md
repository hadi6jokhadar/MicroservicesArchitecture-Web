# Zard UI — Angular 20 Rules

## Critical Rules — Always Follow
- Standalone: `standalone: true` always
- Signals: `input<T>()` NOT `@Input()`
- Outputs: `output<T>()` NOT `@Output() EventEmitter`
- State: `signal()` for local, `computed()` for derived
- DI: `inject(Service)` NOT constructor injection
- Forms: `inject(FormBuilder)` + ReactiveFormsModule
- Change detection: `ChangeDetectionStrategy.OnPush` always
- NEVER use `ngModel`, `@Input()`, `@Output()`, NgModules

## Import Pattern
```typescript
import { ZardButtonComponent, ZardInputDirective } from '@ihsan/ui';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ZardButtonComponent, ZardInputDirective],
})
```

## Reactive Form Pattern
```typescript
export class MyComponent {
  private fb = inject(FormBuilder);
  protected isLoading = signal(false);
  protected form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected onSubmit() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
  }
}
```

---
## Quick Reference — All Components

| Component | Selector | Classes | Import |
|---|---|---|---|
| accordion | `z-accordion` | `ZardAccordionItemComponent`, `ZardAccordionComponent` | `import { ZardAccordionItemComponent } from '@ihsan/ui'` |
| alert | `z-alert` | `ZardAlertComponent` | `import { ZardAlertComponent } from '@ihsan/ui'` |
| alert-dialog | `z-alert-dialog` | `ZardAlertDialogOptions`, `ZardAlertDialogComponent`, `ZardAlertDialogModule`, `ZardAlertDialogService` | `import { ZardAlertDialogComponent } from '@ihsan/ui'` |
| avatar | `z-avatar` | `ZardAvatarGroupComponent`, `ZardAvatarComponent` | `import { ZardAvatarGroupComponent } from '@ihsan/ui'` |
| badge | `z-badge` | `ZardBadgeComponent` | `import { ZardBadgeComponent } from '@ihsan/ui'` |
| breadcrumb | `z-breadcrumb-ellipsis` | `ZardBreadcrumbEllipsisComponent`, `ZardBreadcrumbItemComponent`, `ZardBreadcrumbComponent` | `import { ZardBreadcrumbEllipsisComponent } from '@ihsan/ui'` |
| button | `z-button` | `ZardButtonComponent` | `import { ZardButtonComponent } from '@ihsan/ui'` |
| button-group | `z-button-group` | `ZardButtonGroupComponent`, `ZardButtonGroupDividerComponent`, `ZardButtonGroupTextDirective` | `import { ZardButtonGroupComponent } from '@ihsan/ui'` |
| calendar | `z-calendar` | `ZardCalendarGridComponent`, `ZardCalendarNavigationComponent`, `ZardCalendarComponent` | `import { ZardCalendarGridComponent } from '@ihsan/ui'` |
| card | `z-card` | `ZardCardComponent` | `import { ZardCardComponent } from '@ihsan/ui'` |
| carousel | `z-carousel` | `ZardCarouselContentComponent`, `ZardCarouselItemComponent`, `ZardCarouselPluginsService`, `ZardCarouselComponent` | `import { ZardCarouselContentComponent } from '@ihsan/ui'` |
| checkbox | `z-checkbox` | `ZardCheckboxComponent` | `import { ZardCheckboxComponent } from '@ihsan/ui'` |
| combobox | `z-combobox` | `ZardComboboxComponent` | `import { ZardComboboxComponent } from '@ihsan/ui'` |
| command | `z-command` | `ZardCommandDividerComponent`, `ZardCommandEmptyComponent`, `ZardCommandInputComponent`, `ZardCommandListComponent`, `ZardCommandOptionGroupComponent`, `ZardCommandOptionComponent`, `ZardCommandComponent` | `import { ZardCommandDividerComponent } from '@ihsan/ui'` |
| date-picker | `z-date-picker` | `ZardDatePickerComponent` | `import { ZardDatePickerComponent } from '@ihsan/ui'` |
| dialog | `z-dialog` | `ZardDialogOptions`, `ZardDialogComponent`, `ZardDialogModule`, `ZardDialogService` | `import { ZardDialogComponent } from '@ihsan/ui'` |
| divider | `z-divider` | `ZardDividerComponent` | `import { ZardDividerComponent } from '@ihsan/ui'` |
| dropdown | `z-dropdown-menu` | `ZardDropdownMenuItemComponent`, `ZardDropdownMenuContentComponent`, `ZardDropdownDirective`, `ZardDropdownMenuComponent`, `ZardDropdownService` | `import { ZardDropdownMenuItemComponent } from '@ihsan/ui'` |
| empty | `z-empty` | `ZardEmptyComponent` | `import { ZardEmptyComponent } from '@ihsan/ui'` |
| form | `z-form-field` | `ZardFormFieldComponent`, `ZardFormControlComponent`, `ZardFormLabelComponent`, `ZardFormMessageComponent` | `import { ZardFormFieldComponent } from '@ihsan/ui'` |
| icon | `z-icon` | `ZardIconComponent` | `import { ZardIconComponent } from '@ihsan/ui'` |
| input | `input[z-input]` | `ZardInputDirective` | `import { ZardInputDirective } from '@ihsan/ui'` |
| input-group | `z-input-group` | `ZardInputGroupComponent` | `import { ZardInputGroupComponent } from '@ihsan/ui'` |
| kbd | `z-kbd` | `ZardKbdGroupComponent`, `ZardKbdComponent` | `import { ZardKbdGroupComponent } from '@ihsan/ui'` |
| layout | `z-sidebar` | `ContentComponent`, `FooterComponent`, `HeaderComponent`, `LayoutComponent`, `SidebarComponent`, `SidebarGroupComponent`, `SidebarGroupLabelComponent` | `import { ContentComponent } from '@ihsan/ui'` |
| loader | `z-loader` | `ZardLoaderComponent` | `import { ZardLoaderComponent } from '@ihsan/ui'` |
| menu | `[z-menu]` | `ZardContextMenuDirective`, `ZardMenuContentDirective`, `ZardMenuItemDirective`, `ZardMenuLabelComponent`, `ZardMenuManagerService`, `ZardMenuShortcutComponent`, `ZardMenuDirective` | `import { ZardContextMenuDirective } from '@ihsan/ui'` |
| pagination | `ul[z-pagination-content]` | `ZardPaginationContentComponent`, `ZardPaginationItemComponent`, `ZardPaginationButtonComponent`, `ZardPaginationPreviousComponent`, `ZardPaginationNextComponent`, `ZardPaginationEllipsisComponent`, `ZardPaginationComponent` | `import { ZardPaginationContentComponent } from '@ihsan/ui'` |
| popover | `[zPopover]` | `ZardPopoverDirective`, `ZardPopoverComponent` | `import { ZardPopoverDirective } from '@ihsan/ui'` |
| progress-bar | `z-progress-bar` | `ZardProgressBarComponent` | `import { ZardProgressBarComponent } from '@ihsan/ui'` |
| radio | `z-radio` | `ZardRadioComponent` | `import { ZardRadioComponent } from '@ihsan/ui'` |
| resizable | `z-resizable` | `ZardResizableHandleComponent`, `ZardResizablePanelComponent`, `ZardResizableComponent` | `import { ZardResizableHandleComponent } from '@ihsan/ui'` |
| segmented | `z-segmented-item` | `ZardSegmentedItemComponent`, `ZardSegmentedComponent` | `import { ZardSegmentedItemComponent } from '@ihsan/ui'` |
| select | `z-select` | `ZardSelectItemComponent`, `ZardSelectComponent` | `import { ZardSelectItemComponent } from '@ihsan/ui'` |
| sheet | `z-sheet` | `ZardSheetOptions`, `ZardSheetComponent`, `ZardSheetService` | `import { ZardSheetComponent } from '@ihsan/ui'` |
| skeleton | `z-skeleton` | `ZardSkeletonComponent` | `import { ZardSkeletonComponent } from '@ihsan/ui'` |
| slider | `z-slider-track` | `ZSliderTrackComponent`, `ZSliderRangeComponent`, `ZSliderThumbComponent`, `ZardSliderComponent` | `import { ZSliderTrackComponent } from '@ihsan/ui'` |
| switch | `z-switch` | `ZardSwitchComponent` | `import { ZardSwitchComponent } from '@ihsan/ui'` |
| table | `table[z-table]` | `ZardTableComponent`, `ZardTableHeaderComponent`, `ZardTableBodyComponent`, `ZardTableRowComponent`, `ZardTableHeadComponent`, `ZardTableCellComponent`, `ZardTableCaptionComponent` | `import { ZardTableComponent } from '@ihsan/ui'` |
| tabs | `z-tab` | `ZardTabComponent`, `ZardTabGroupComponent` | `import { ZardTabComponent } from '@ihsan/ui'` |
| toast | `z-toast` | `ZardToastComponent` | `import { ZardToastComponent } from '@ihsan/ui'` |
| toggle | `z-toggle` | `ZardToggleComponent` | `import { ZardToggleComponent } from '@ihsan/ui'` |
| toggle-group | `z-toggle-group` | `ZardToggleGroupComponent` | `import { ZardToggleGroupComponent } from '@ihsan/ui'` |