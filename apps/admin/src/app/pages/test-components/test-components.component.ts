import { Component, signal, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ZardAccordionComponent,
  ZardAccordionItemComponent,
  ZardAlertComponent,
  ZardAlertDialogService,
  ZardAvatarComponent,
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardButtonGroupComponent,
  ZardCalendarComponent,
  ZardCardComponent,
  ZardCarouselComponent,
  ZardCarouselContentComponent,
  ZardCarouselItemComponent,
  ZardCheckboxComponent,
  ZardDatePickerComponent,
  ZardDialogService,
  ZardDividerComponent,
  ZardDropdownMenuComponent,
  ZardDropdownMenuItemComponent,
  ZardDropdownMenuLabelComponent,
  ZardDropdownMenuContentComponent,
  ZardDropdownDirective,
  ZardEmptyComponent,
  ZardIconComponent,
  ZardInputDirective,
  ZardInputGroupComponent,
  ZardKbdComponent,
  ZardLoaderComponent,
  ZardPaginationComponent,
  ZardPopoverComponent,
  ZardProgressBarComponent,
  ZardRadioComponent,
  ZardResizableComponent,
  ZardResizablePanelComponent,
  ZardResizableHandleComponent,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardSheetService,
  ZardSkeletonComponent,
  ZardSliderComponent,
  ZardSwitchComponent,
  ZardTabComponent,
  ZardTabGroupComponent,
  ZardToastComponent,
  ZardToggleComponent,
  ZardTooltipDirective,
  ZardBreadcrumbImports,
} from '@ihsan/ui';

interface ITestForm {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  agree: FormControl<boolean | null>;
}

@Component({
  selector: 'app-test-components',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardAccordionComponent,
    ZardAccordionItemComponent,
    ZardAlertComponent,
    ZardAvatarComponent,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardButtonGroupComponent,
    ZardCalendarComponent,
    ZardCardComponent,
    ZardCarouselComponent,
    ZardCarouselContentComponent,
    ZardCarouselItemComponent,
    ZardCheckboxComponent,
    ZardDatePickerComponent,
    ZardDividerComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDropdownMenuLabelComponent,
    ZardDropdownMenuContentComponent,
    ZardDropdownDirective,
    ZardEmptyComponent,
    ZardIconComponent,
    ZardInputDirective,
    ZardInputGroupComponent,
    ZardKbdComponent,
    ZardLoaderComponent,
    ZardPaginationComponent,
    ZardPopoverComponent,
    ZardProgressBarComponent,
    ZardRadioComponent,
    ZardResizableComponent,
    ZardResizablePanelComponent,
    ZardResizableHandleComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardSkeletonComponent,
    ZardSliderComponent,
    ZardSwitchComponent,
    ZardTabComponent,
    ZardTabGroupComponent,
    ZardToastComponent,
    ZardToggleComponent,
    ZardTooltipDirective,
    ZardBreadcrumbImports,
  ],
  templateUrl: './test-components.component.html',
  styleUrls: ['./test-components.component.scss'],
})
export class TestComponentsComponent {
  private _fb = inject(FormBuilder);
  private _dialogService = inject(ZardDialogService);
  private _alertDialogService = inject(ZardAlertDialogService);
  private _sheetService = inject(ZardSheetService);

  // Signals
  currentPage = signal<number>(1);
  switchValue = signal<boolean>(false);
  checkboxValue = signal<boolean>(false);
  toggleValue = signal<boolean>(false);
  sliderValue = signal<number>(50);
  selectedDate = signal<Date>(new Date());
  progressValue = signal<number>(65);
  selectedTab = signal<string>('tab1');
  segmentedValue = signal<string>('option1');
  toastVisible = signal<boolean>(false);

  // Form
  testForm: FormGroup<ITestForm>;

  // Data
  selectOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  comboboxItems = [
    { value: 'item1', label: 'Item 1' },
    { value: 'item2', label: 'Item 2' },
    { value: 'item3', label: 'Item 3' },
  ];

  tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'Inactive',
    },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
  ];

  breadcrumbItems = [
    { label: 'Home', url: '/' },
    { label: 'Components', url: '/test-components' },
    { label: 'Test Page' },
  ];

  radioOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  segmentedOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  toggleGroupOptions = [
    { value: 'bold', icon: 'bold' },
    { value: 'italic', icon: 'italic' },
    { value: 'underline', icon: 'underline' },
  ];

  carouselItems = [
    { id: 1, title: 'Slide 1', description: 'First slide content' },
    { id: 2, title: 'Slide 2', description: 'Second slide content' },
    { id: 3, title: 'Slide 3', description: 'Third slide content' },
  ];

  constructor() {
    this.testForm = this._fb.group({
      name: this._fb.control<string | null>('', Validators.required),
      email: this._fb.control<string | null>('', [
        Validators.required,
        Validators.email,
      ]),
      agree: this._fb.control<boolean | null>(false, Validators.requiredTrue),
    });
  }

  onOpenDialog(): void {
    this._dialogService.create({
      zTitle: 'Example Dialog',
      zDescription: 'This is a test dialog from Zardui',
      zContent: '',
    });
  }

  onOpenAlertDialog(): void {
    this._alertDialogService.create({
      zTitle: 'Alert Dialog',
      zDescription: 'This is an alert dialog example',
      zContent: '',
    });
  }

  onOpenSheet(): void {
    this._sheetService.create({
      zTitle: 'Example Sheet',
      zDescription: 'This is a test sheet from Zardui',
      zContent: '',
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    console.log('Page changed to:', page);
  }

  onSwitchChange(value: boolean): void {
    this.switchValue.set(value);
    console.log('Switch value:', value);
  }

  onCheckboxChange(value: boolean): void {
    this.checkboxValue.set(value);
    console.log('Checkbox value:', value);
  }

  onToggleChange(value: boolean): void {
    this.toggleValue.set(value);
    console.log('Toggle value:', value);
  }

  onSliderChange(value: number): void {
    this.sliderValue.set(value);
    console.log('Slider value:', value);
  }

  onDateChange(date: Date): void {
    this.selectedDate.set(date);
    console.log('Date selected:', date);
  }

  onSubmitForm(): void {
    if (this.testForm.valid) {
      console.log('Form submitted:', this.testForm.value);
    }
  }

  showToast(): void {
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }
}
