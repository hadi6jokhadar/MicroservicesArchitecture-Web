import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  inject,
  InjectionToken,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CalendarValue,
  mergeClasses,
  Z_MODAL_DATA,
  ZARD_ICONS,
  ZardAccordionComponent,
  ZardAccordionItemComponent,
  ZardAlertComponent,
  ZardAlertDialogService,
  ZardAvatarComponent,
  ZardAvatarGroupComponent,
  ZardBadgeComponent,
  ZardBreadcrumbImports,
  ZardButtonComponent,
  ZardButtonGroupComponent,
  ZardButtonGroupDividerComponent,
  ZardCalendarComponent,
  ZardCardComponent,
  ZardCarouselComponent,
  ZardCarouselContentComponent,
  ZardCarouselItemComponent,
  ZardCarouselPluginsService,
  ZardCheckboxComponent,
  ZardComboboxComponent,
  ZardComboboxGroup,
  ZardComboboxOption,
  ZardCommandComponent,
  ZardCommandDividerComponent,
  ZardCommandEmptyComponent,
  ZardCommandInputComponent,
  ZardCommandListComponent,
  ZardCommandOption,
  ZardCommandOptionComponent,
  ZardCommandOptionGroupComponent,
  ZardDatePickerComponent,
  ZardDialogService,
  ZardDividerComponent,
  ZardDropdownDirective,
  ZardDropdownImports,
  ZardDropdownMenuContentComponent,
  ZardDropdownMenuItemComponent,
  ZardEmptyComponent,
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardInputGroupComponent,
  ZardKbdComponent,
  ZardKbdGroupComponent,
  ZardLoaderComponent,
  ZardMenuImports,
  ZardPaginationComponent,
  ZardPaginationImports,
  ZardPopoverComponent,
  ZardPopoverDirective,
  ZardProgressBarComponent,
  ZardRadioComponent,
  ZardResizableComponent,
  ZardResizableHandleComponent,
  ZardResizablePanelComponent,
  ZardSegmentedComponent,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardSheetService,
  ZardSkeletonComponent,
  ZardSliderComponent,
  ZardSwitchComponent,
  ZardTabComponent,
  ZardTabGroupComponent,
  ZardToggleComponent,
  ZardToggleGroupComponent,
  ZardToggleGroupItem,
  ZardTooltipDirective,
  type zAlign,
  type zPosition,
} from '@ihsan/ui';

import { FormsModule } from '@angular/forms';

import {
  email,
  form,
  FormField,
  maxLength,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toast } from 'ngx-sonner';

import { type EmblaCarouselType, type EmblaPluginType } from 'embla-carousel';
import { TestComponent } from './test/test';

export interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
}

interface Person {
  key: string;
  name: string;
  age: number;
  address: string;
}

interface iDialogData {
  name: string;
  username: string;
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
    ZardDropdownMenuItemComponent,
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
    ZardToggleComponent,
    ZardTooltipDirective,
    ZardBreadcrumbImports,
    ZardFormImports,
    FormField,
    ZardAvatarGroupComponent,
    ZardMenuImports,
    ZardButtonGroupDividerComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIdDirective,
    ZardSegmentedComponent,
    FormsModule,
    ZardComboboxComponent,
    ZardCommandComponent,
    ZardCommandInputComponent,
    ZardCommandListComponent,
    ZardCommandEmptyComponent,
    ZardCommandOptionGroupComponent,
    ZardCommandOptionComponent,
    ZardCommandDividerComponent,
    ZardDropdownImports,
    ZardInputGroupComponent,
    ZardInputDirective,
    ZardKbdGroupComponent,
    ZardPaginationImports,
    ZardPopoverComponent,
    ZardPopoverDirective,
    ZardToggleGroupComponent,
  ],
  templateUrl: './test-components.component.html',
  styleUrls: ['./test-components.component.scss'],
})
export class TestComponentsComponent implements OnInit, AfterViewInit {
  private _fb = inject(FormBuilder);
  private _dialogService = inject(ZardDialogService);
  private _alertDialogService = inject(ZardAlertDialogService);
  private _sheetService = inject(ZardSheetService);
  private readonly destroyRef = inject(DestroyRef);
  private zData: iDialogData | null = inject(Z_MODAL_DATA, { optional: true });

  private readonly pluginsService = inject(ZardCarouselPluginsService);

  smallValue = '';
  defaultValue = '';
  largeValue = '';

  carouselOptions = {
    loop: true,
    align: 'center' as const,
  };

  plugins: EmblaPluginType[] = [];

  protected readonly isAutoplayActive = signal(false);
  protected readonly currentSlide = signal(1);
  protected readonly totalSlides = signal(0);

  protected slides = ['1', '2', '3', '4', '5'];

  constructor() {
    // Track message length
    this.form.controls.message.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.messageLength.set(value?.length ?? 0);
      });

    // Set min date to today
    this.minDate.setHours(0, 0, 0, 0);

    // Set max date to 30 days from now
    this.maxDate.setHours(23, 59, 59, 999);
  }

  ngOnInit(): void {
    // Autoplay by default
    this.toggleAutoplay().catch((err) => {
      console.error('Failed to initialize autoplay:', err);
      this.isAutoplayActive.set(false);
    });
  }

  ngAfterViewInit(): void {
    this.form.get('novalue')?.disable();
    this.form.patchValue({ name: 'John Doe' });

    if (this.zData) {
      this.form.patchValue(this.zData);
    }
  }

  protected event = 'none';

  protected onShow() {
    this.event = '(zShow)';
  }

  protected onHide() {
    this.event = '(zHide)';
  }

  items: ZardToggleGroupItem[] = [
    {
      value: 'bold',
      icon: 'bold',
      label: 'Bold',
      ariaLabel: 'Toggle bold',
    },
    {
      value: 'italic',
      icon: 'italic',
      label: 'Italic',
      ariaLabel: 'Toggle italic',
    },
    {
      value: 'underline',
      icon: 'underline',
      label: 'Underline',
      ariaLabel: 'Toggle underline',
    },
  ];

  onToggleChange(value: string | string[]) {
    console.log('Selected formatting:', value);
  }

  protected lightOn = false;

  currentPosition:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right' = 'bottom-right';

  showToastPosition(
    position:
      | 'top-left'
      | 'top-center'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-center'
      | 'bottom-right'
  ) {
    this.currentPosition = position;

    toast(`Toast at ${position.replace('-', ' ')}`, {
      action: {
        label: 'Close',
        onClick: () => console.log('Toast closed'),
      },
      position: position,
    });
  }

  showToast() {
    toast.success('Event created successfully', {
      description: 'Your event has been saved and will start soon.',
    });
  }

  showToastLoader() {
    const promise = () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ name: 'Sonner' }), 2000)
      );

    toast.promise(promise, {
      loading: 'Loading...',
      success: (data: any) => `${data.name} has been created`,
      error: 'Error',
    });
  }
  protected zTabsPosition: zPosition = 'top';
  protected zActivePosition: zPosition = 'bottom';
  zAlignTabs: zAlign = 'start';

  showWithAction() {
    toast('Event created', {
      description: 'Your event has been saved successfully.',
      action: {
        label: 'View',
        onClick: () => console.log('View clicked'),
      },
    });
  }

  showCustomDuration() {
    toast('This toast lasts 8 seconds', {
      description: 'Custom duration example.',
      duration: 8000,
    });
  }

  listOfData: Person[] = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ];

  payments: Payment[] = [
    {
      id: 'm5gr84i9',
      amount: 316,
      status: 'success',
      email: 'ken99@example.com',
    },
    {
      id: '3u1reuv4',
      amount: 242,
      status: 'success',
      email: 'Abe45@example.com',
    },
    {
      id: 'derv1ws0',
      amount: 837,
      status: 'processing',
      email: 'Monserrat44@example.com',
    },
    {
      id: '5kma53ae',
      amount: 874,
      status: 'success',
      email: 'Silas22@example.com',
    },
    {
      id: 'bhqecj4p',
      amount: 721,
      status: 'failed',
      email: 'carmella@example.com',
    },
    {
      id: 'abc123ef',
      amount: 456,
      status: 'pending',
      email: 'jane.doe@example.com',
    },
  ];

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  getStatusVariant(
    status: Payment['status']
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'success':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  }

  copyPaymentId(id: string): void {
    navigator.clipboard.writeText(id);
    console.log('Payment ID copied:', id);
  }

  viewDetails(payment: Payment): void {
    console.log('View payment details:', payment);
  }

  model = false;
  checkControl = new FormControl({ value: true, disabled: true });

  readonly selectedValues = signal<string[]>([]);
  selectedValue = '';

  segmentedOptions2 = [
    { value: 'tab1', label: 'Tab 1' },
    { value: 'tab2', label: 'Tab 2' },
    { value: 'tab3', label: 'Tab 3' },
  ];

  optionsWithDisabled = [
    { value: 'enabled1', label: 'Enabled' },
    { value: 'disabled1', label: 'Disabled', disabled: true },
    { value: 'enabled2', label: 'Enabled' },
    { value: 'disabled2', label: 'Disabled', disabled: true },
  ];

  options = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'archived', label: 'Archived' },
  ];

  onSelectionChange(value: string) {
    console.log('Selected:', value);
  }

  val = 'a';
  selected = 'default';

  readonly popoverDirective = viewChild.required('popoverTrigger', {
    read: ZardPopoverDirective,
  });

  readonly width = signal('100%');
  readonly height = signal('25px');

  saveChanges() {
    console.log('Settings saved:', {
      width: this.width(),
      height: this.height(),
    });
    this.popoverDirective().hide();
  }

  readonly searchQuery = signal('');

  readonly iconNames = Object.keys(ZARD_ICONS) as Array<
    keyof typeof ZARD_ICONS
  >;
  readonly totalIcons = this.iconNames.length;

  readonly filteredIcons = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.iconNames;
    }

    return this.iconNames.filter((iconName) =>
      iconName.toLowerCase().includes(query)
    );
  });

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  async copyIconCode(iconName: string): Promise<void> {
    const code = `<z-icon zType="${iconName}" />`;

    try {
      await navigator.clipboard.writeText(code);

      toast.success('Icon copied!', {
        description: `<z-icon zType="${iconName}" />`,
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy', {
        description: 'Could not copy to clipboard',
        duration: 2000,
      });
    }
  }

  submitted = false;

  validationForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    website: new FormControl('', [Validators.pattern(/^https?:\/\/.+/)]),
  });

  get nameControl() {
    return this.validationForm.get('name')!;
  }

  get emailControl() {
    return this.validationForm.get('email')!;
  }

  get websiteControl() {
    return this.validationForm.get('website')!;
  }

  onSubmit() {
    if (this.validationForm.valid) {
      this.submitted = true;
      console.log('Form submitted:', this.validationForm.value);

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.submitted = false;
      }, 3000);
    }
  }

  resetValidation() {
    this.validationForm.reset();
    this.submitted = false;
  }

  private readonly loginModel = signal({
    username: '',
    email: '',
    password: '',
  });

  profileForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  protected readonly profileFormTree = form(this.loginModel, (login) => {
    required(login.username);
    minLength(login.username, 3);
    maxLength(login.username, 20);

    required(login.email);
    email(login.email);

    required(login.password);
    minLength(login.password, 6);
  });

  async onFormTreeSubmit(event: Event) {
    event.preventDefault();
    await submit(this.profileFormTree, async (form) => {
      console.log('Form submitted:', form().value());
    });
  }

  onSubmitValidation() {
    if (this.validationForm.valid) {
      console.log('Form submitted:', this.validationForm.value);
    }
  }

  fullName = '';
  email = '';
  bio = '';

  readonly showSuccess = signal(false);
  readonly isSubmitting = signal(false);

  readonly countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'br', label: 'Brazil' },
  ] as const;

  readonly form = this._fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    country: ['', Validators.required],
    company: [''],
    message: ['', Validators.maxLength(500)],
    newsletter: [false],
    terms: [false, Validators.requiredTrue],
    name: [''],
    novalue: [''],
    username: new FormControl('@peduarte'),
    region: new FormControl(''),
  });

  readonly messageLength = signal(0);

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getEmailError(): string {
    const email = this.form.get('email');
    if (email?.hasError('required')) {
      return 'Email is required';
    }
    if (email?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  async handleSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    await this.simulateApiCall();

    this.isSubmitting.set(false);
    this.showSuccess.set(true);

    console.log('Form submitted:', this.form.getRawValue());

    setTimeout(() => {
      this.showSuccess.set(false);
    }, 5000);
  }

  resetForm(): void {
    this.form.reset();
    this.showSuccess.set(false);
    this.messageLength.set(0);
  }

  private simulateApiCall(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  readonly selectedDateSm = signal<Date | null>(null);
  readonly selectedDateDefault = signal<Date | null>(null);
  readonly selectedDateLg = signal<Date | null>(null);

  onDateChangeSm(date: Date | null) {
    this.selectedDateSm.set(date);
    console.log('Selected date (sm):', date);
  }

  onDateChangeDefault(date: Date | null) {
    this.selectedDateDefault.set(date);
    console.log('Selected date (default):', date);
  }

  onDateChangeLg(date: Date | null) {
    this.selectedDateLg.set(date);
    console.log('Selected date (lg):', date);
  }

  readonly selectedDate = signal<Date | null>(null);

  onDateChange(date: Date | null) {
    this.selectedDate.set(date);
    console.log('Selected date:', date);
  }

  onDatesChange(date: NonNullable<CalendarValue>) {
    console.log('Selected date:', date);
  }

  onCardActionClick() {
    console.log('on Card Action Click');
  }

  // Handle command selection
  handleCommand(option: ZardCommandOption) {
    const action = `Executed "${option.label}" (value: ${option.value})`;
    console.log(action);

    // You can add real logic here
    switch (option.value) {
      case 'new-project':
        this.showAlert('Creating new project...');
        break;
      case 'open-file':
        this.showAlert('Opening file dialog...');
        break;
      case 'save-all':
        this.showAlert('Saving all files...');
        break;
      case 'dashboard':
        this.showAlert('Navigating to Dashboard...');
        break;
      case 'projects':
        this.showAlert('Navigating to Projects...');
        break;
      case 'terminal':
        this.showAlert('Opening terminal...');
        break;
      case 'theme':
        this.showAlert('Toggling theme...');
        break;
      default:
        this.showAlert(`Action: ${option.label}`);
    }
  }

  // Handle keyboard shortcuts
  handleKeydown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey) {
      if ('nos12td'.includes(event.key.toLowerCase())) {
        event.preventDefault();
      }

      switch (event.key.toLowerCase()) {
        case 'n':
          this.executeCommand('new-project', 'Create new project');
          break;
        case 'o':
          this.executeCommand('open-file', 'Open file');
          break;
        case 's':
          this.executeCommand('save-all', 'Save all');
          break;
        case '1':
          this.executeCommand('dashboard', 'Go to Dashboard');
          break;
        case '2':
          this.executeCommand('projects', 'Go to Projects');
          break;
        case 't':
          this.executeCommand('terminal', 'Open terminal');
          break;
        case 'd':
          this.executeCommand('theme', 'Toggle theme');
          break;
      }
    }
  }

  private executeCommand(value: string, label: string) {
    this.handleCommand({ value, label } as ZardCommandOption);
  }

  private showAlert(message: string, isWarning = false) {
    if (isWarning) {
      console.warn(message);
    } else {
      console.log(message);
    }

    // In a real app, you might show a toast notification here
    setTimeout(() => {
      // You could clear the action after some time
    }, 3000);
  }
  techGroups: ZardComboboxGroup[] = [
    {
      label: 'Frontend Frameworks',
      options: [
        { value: 'angular', label: 'Angular' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue.js' },
        { value: 'svelte', label: 'Svelte' },
      ],
    },
    {
      label: 'Backend Frameworks',
      options: [
        { value: 'nestjs', label: 'NestJS' },
        { value: 'express', label: 'Express' },
        { value: 'fastify', label: 'Fastify' },
        { value: 'koa', label: 'Koa' },
      ],
    },
    {
      label: 'Full-Stack Frameworks',
      options: [
        { value: 'nextjs', label: 'Next.js' },
        { value: 'nuxtjs', label: 'Nuxt.js' },
        { value: 'remix', label: 'Remix' },
        { value: 'sveltekit', label: 'SvelteKit' },
      ],
    },
  ];

  onSelect(option: ZardComboboxOption) {
    console.log('Selected:', option);
  }

  onComboboxSelect(option: ZardComboboxOption) {
    console.log('Selected:', option);
  }

  frameworkControl = new FormControl<string | null>(null);

  frameworks: ZardComboboxOption[] = [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'ember', label: 'Ember.js' },
  ];

  setValue() {
    this.frameworkControl.setValue('vue');
  }

  clearValue() {
    this.frameworkControl.setValue(null);
  }

  logValue() {
    console.log('Form Control Value:', this.frameworkControl.value);
  }

  frameworksWithDisabled: ZardComboboxOption[] = [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React', disabled: true },
    { value: 'vue', label: 'Vue.js' },
    { value: 'svelte', label: 'Svelte', disabled: true },
    { value: 'ember', label: 'Ember.js' },
  ];

  checked = true;

  readonly currentSpacing = signal<'sm' | 'md' | 'lg' | 'xl'>('md');

  // Computed classes based on current spacing
  protected readonly contentSpacingClass = computed(() => {
    const spacing = this.currentSpacing();
    const spacingMap = {
      sm: '-ml-2',
      md: '-ml-4',
      lg: '-ml-6',
      xl: '-ml-8',
    };
    return spacingMap[spacing];
  });

  protected readonly itemSpacingClass = computed(() => {
    const spacing = this.currentSpacing();
    const spacingMap = {
      sm: 'pl-2',
      md: 'pl-4',
      lg: 'pl-6',
      xl: 'pl-8',
    };
    return mergeClasses('basis-1/3', spacingMap[spacing]);
  });

  carouselOptions2 = [
    {
      value: 'sm',
      label: 'Small',
    },
    {
      value: 'md',
      label: 'Medium',
    },
    {
      value: 'lg',
      label: 'Large',
    },
    {
      value: 'xl',
      label: 'Extra Large',
    },
  ];

  onChange(value: string) {
    this.currentSpacing.set(value as 'sm' | 'md' | 'lg' | 'xl');
  }

  onCarouselInit(api: EmblaCarouselType) {
    this.carouselApi.set(api);

    this.totalSlides.set(api.scrollSnapList().length);
    this.currentSlide.set(api.selectedScrollSnap() + 1);
    this.update();
  }

  protected onSlideChange(): void {
    this.currentSlide.set((this.carouselApi()?.selectedScrollSnap() ?? 0) + 1);
    this.update();
  }

  async toggleAutoplay() {
    this.isAutoplayActive.update((b) => !b);
    if (this.isAutoplayActive()) {
      await this.startAutoplay();
    } else {
      this.pauseAutoplay();
    }
    this.reinitCarousel();
  }

  toggleLoop() {
    this.carouselOptions = {
      ...this.carouselOptions,
      loop: !this.carouselOptions.loop,
    };

    this.reinitCarousel();
  }

  private async startAutoplay() {
    const autoplayPlugin = await this.pluginsService.createAutoplayPlugin({
      stopOnMouseEnter: true,
      delay: 2000,
      stopOnInteraction: false,
    });
    this.plugins = [
      ...this.plugins.filter((p) => p.name !== 'autoplay'),
      autoplayPlugin,
    ];
  }

  private pauseAutoplay(): void {
    this.plugins = this.plugins.filter((p) => p.name !== 'autoplay');
  }

  private reinitCarousel() {
    if (this.carouselApi()) {
      this.carouselApi()?.reInit(this.carouselOptions, this.plugins);
    }
  }

  // Math for template
  Math = Math;

  // Carousel API signal
  private carouselApi = signal<EmblaCarouselType | null>(null);

  // Reactive state from carousel API
  protected readonly scrollProgress = signal<number>(0);
  protected readonly slidesInView = signal<number[]>([]);

  // Computed signals for API methods
  protected readonly canScrollPrev = signal(false);

  protected readonly canScrollNext = signal(false);

  private update(): void {
    const api = this.carouselApi();
    if (api) {
      this.scrollProgress.set(api.scrollProgress());
      this.totalSlides.set(api.scrollSnapList().length);
      this.currentSlide.set(api.selectedScrollSnap() + 1);
      this.slidesInView.set(api.slidesInView());
      this.canScrollPrev.set(api.canScrollPrev());
      this.canScrollNext.set(api.canScrollNext());
    }
  }

  goToPrevious() {
    this.carouselApi()?.scrollPrev();
  }

  goToNext() {
    this.carouselApi()?.scrollNext();
  }

  goToSlide(index: number) {
    this.carouselApi()?.scrollTo(index);
  }

  protected onActionClick(): void {
    alert('Redirect to Sign Up');
  }

  DAYS_IN_FUTURE = 30;
  MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
  minDate = new Date();
  maxDate = new Date(
    Date.now() + this.DAYS_IN_FUTURE * this.MILLISECONDS_PER_DAY
  );

  readonly dateRange = signal<Date[] | null>(null);

  formatDate(date?: Date[] | null, label: 'start' | 'end' = 'start'): string {
    if (!date || date?.length === 0) {
      return 'N/A';
    }

    const targetDate = label === 'start' ? date[0] : date[1];
    if (!targetDate) {
      return 'N/A';
    }

    return targetDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  readonly selectedDates = signal<Date[] | null>(null);

  protected readonly CURRENCIES = [
    { symbol: '€', code: 'EUR' },
    { symbol: '$', code: 'USD' },
    { symbol: '£', code: 'GBP' },
    { symbol: '¥', code: 'JPY' },
  ];

  protected readonly currency = signal(this.CURRENCIES[1].code);

  private alertDialogService = inject(ZardAlertDialogService);

  showAlertDialog() {
    this.alertDialogService.confirm({
      zTitle: 'Are you absolutely sure?',
      zDescription:
        'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
      zOkText: 'Continue',
      zCancelText: 'Cancel',
    });
  }

  readonly defaults: string[] = ['item-1', 'item-3'];

  openDialog() {
    this._dialogService.create({
      zTitle: 'Edit Profile',
      zDescription: `Make changes to your profile here. Click save when you're done.`,
      zContent: TestComponent,
      zData: {
        name: 'Samuel Rizzon',
        username: '@samuelrizzondev',
        region: 'america',
      } as iDialogData,
      zOkText: 'Save changes',
      zOnOk: (instance) => {
        console.log('Form submitted:', instance);
      },
      zWidth: '425px',
    });
  }

  log(value: string) {
    console.log(value);
  }

  readonly totalPages = 5;
  readonly currentPage = signal(3);

  readonly pages = signal<number[]>(
    Array.from({ length: this.totalPages }, (_, i) => i + 1)
  );

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  goToPreviousCustom() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  goToNextCustom() {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.update((p) => p + 1);
    }
  }

  openWideSheet() {
    this._sheetService.create({
      zTitle: 'Wide Sheet',
      zDescription: 'This sheet has a custom width of 500px',
      zContent: `
        <div class="p-4">
          <p>This is a wide sheet with custom width.</p>
          <p>Perfect for forms that need more horizontal space.</p>
        </div>
      `,
      zSide: 'right',
      zWidth: '500px',
      zOkText: 'Got it',
    });
  }

  openTallSheet() {
    this._sheetService.create({
      zTitle: 'Tall Sheet',
      zDescription: 'This sheet has a custom height of 80vh',
      zContent: `
        <div class="p-4 space-y-4">
          <p>This is a tall sheet with custom height (80% of viewport height).</p>
          <p>Great for content that needs vertical space.</p>
          <div class="h-96 bg-gray-100 rounded-md flex items-center justify-center">
            <p class="text-gray-500">Large content area</p>
          </div>
        </div>
      `,
      zSide: 'left',
      zHeight: '80vh',
      zOkText: 'Close',
    });
  }

  openCustomSheet() {
    this._sheetService.create({
      zTitle: 'Custom Dimensions',
      zDescription: 'Both width and height customized',
      zContent: `
        <div class="p-4">
          <p>Width: 400px, Height: 60vh</p>
          <p>Complete control over dimensions.</p>
        </div>
      `,
      zSide: 'right',
      zWidth: '400px',
      zHeight: '60vh',
      zOkText: 'Close',
    });
  }

  openTopSheet() {
    this._sheetService.create({
      zTitle: 'Top Sheet',
      zDescription: 'Custom height for top position',
      zContent: `
        <div class="p-4">
          <p>This top sheet has a custom height.</p>
          <p>Height: 50vh</p>
        </div>
      `,
      zSide: 'top',
      zHeight: '50vh',
      zOkText: 'Done',
    });
  }

  openSheetBasic() {
    this._sheetService.create({
      zTitle: 'Edit profile',
      zDescription: `Make changes to your profile here. Click save when you're done.`,
      zContent: TestComponent,
      zData: {
        name: 'Matheus Ribeiro',
        username: '@ribeiromatheus.dev',
      },
      zOkText: 'Save changes',
      zOnOk: (instance) => {
        console.log('Form submitted:', instance);
      },
    });
  }

  protected readonly placement = signal<
    'right' | 'left' | 'top' | 'bottom' | null | undefined
  >('right');

  private sheetService = inject(ZardSheetService);

  openSheetSize() {
    this.sheetService.create({
      zTitle: 'Edit profile',
      zDescription: `Make changes to your profile here. Click save when you're done.`,
      zContent: TestComponent,
      zData: {
        name: 'Matheus Ribeiro',
        username: '@ribeiromatheus.dev',
      },
      zOkText: 'Save changes',
      zOnOk: (instance) => {
        console.log('Form submitted:', instance);
      },
      zSide: this.placement(),
    });
  }

  showArrow = true;
}
