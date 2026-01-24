// Angular Core Imports
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Angular Forms Imports
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  email,
  form,
  FormField,
  maxLength,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';

// External Libraries
import { type EmblaCarouselType, type EmblaPluginType } from 'embla-carousel';
import { toast } from 'ngx-sonner';

// Zardui Components & Services (Alphabetically Sorted)
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

// Local Components
import { TestComponent } from './test/test';

// #region Type Definitions

/**
 * Payment interface for table demonstrations
 */
export interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
}

/**
 * Person interface for table demonstrations
 */
interface Person {
  key: string;
  name: string;
  age: number;
  address: string;
}

/**
 * Dialog data interface
 */
interface iDialogData {
  name: string;
  username: string;
}

// #endregion

@Component({
  selector: 'app-test-components',
  imports: [
    // Angular Core
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormField,

    // Zardui Components (Alphabetically Sorted)
    ZardAccordionComponent,
    ZardAccordionItemComponent,
    ZardAlertComponent,
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
    ZardCheckboxComponent,
    ZardComboboxComponent,
    ZardCommandComponent,
    ZardCommandDividerComponent,
    ZardCommandEmptyComponent,
    ZardCommandInputComponent,
    ZardCommandListComponent,
    ZardCommandOptionComponent,
    ZardCommandOptionGroupComponent,
    ZardDatePickerComponent,
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
    ZardSkeletonComponent,
    ZardSliderComponent,
    ZardSwitchComponent,
    ZardTabComponent,
    ZardTabGroupComponent,
    ZardToggleComponent,
    ZardToggleGroupComponent,
    ZardTooltipDirective,
  ],
  templateUrl: './test-components.component.html',
  styleUrls: ['./test-components.component.scss'],
})
export class TestComponentsComponent implements OnInit, AfterViewInit {
  // #region Dependency Injection

  private readonly _fb = inject(FormBuilder);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _pluginsService = inject(ZardCarouselPluginsService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _zData: iDialogData | null = inject(Z_MODAL_DATA, {
    optional: true,
  });

  // #endregion

  // #region General Properties

  /** Utility: Math object for template calculations */
  protected readonly Math = Math;

  /** General: Event tracking for component interactions */
  protected event = 'none';

  // #endregion

  // #region Accordion Properties

  /** Accordion: Default expanded items */
  protected readonly defaults: string[] = ['item-1', 'item-3'];

  // #endregion

  // #region Calendar Properties

  /** Calendar: Date range configuration */
  protected readonly DAYS_IN_FUTURE = 30;
  protected readonly MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
  protected minDate = new Date();
  protected maxDate = new Date(
    Date.now() + this.DAYS_IN_FUTURE * this.MILLISECONDS_PER_DAY
  );

  /** Calendar: Selected dates */
  protected readonly selectedDates = signal<Date[] | null>(null);
  protected readonly dateRange = signal<Date[] | null>(null);
  protected readonly selectedDate = signal<Date | null>(null);
  protected readonly selectedDateSm = signal<Date | null>(null);
  protected readonly selectedDateDefault = signal<Date | null>(null);
  protected readonly selectedDateLg = signal<Date | null>(null);

  // #endregion

  // #region Carousel Properties

  /** Carousel: Configuration options */
  protected carouselOptions = {
    loop: true,
    align: 'center' as const,
  };

  /** Carousel: Plugins */
  protected plugins: EmblaPluginType[] = [];

  /** Carousel: State */
  protected readonly isAutoplayActive = signal(false);
  protected readonly currentSlide = signal(1);
  protected readonly totalSlides = signal(0);
  protected slides = ['1', '2', '3', '4', '5'];

  /** Carousel: API instance */
  private carouselApi = signal<EmblaCarouselType | null>(null);

  /** Carousel: Reactive state */
  protected readonly scrollProgress = signal<number>(0);
  protected readonly slidesInView = signal<number[]>([]);
  protected readonly canScrollPrev = signal(false);
  protected readonly canScrollNext = signal(false);

  /** Carousel: Spacing configuration */
  protected readonly currentSpacing = signal<'sm' | 'md' | 'lg' | 'xl'>('md');

  /** Carousel: Computed spacing classes */
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

  /** Carousel: Spacing options */
  protected carouselOptions2 = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
  ];

  // #endregion

  // #region Checkbox Properties

  protected checked = true;
  protected model = false;
  protected checkControl = new FormControl({ value: true, disabled: true });

  // #endregion

  // #region Combobox Properties

  protected frameworkControl = new FormControl<string | null>(null);

  protected frameworks: ZardComboboxOption[] = [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'ember', label: 'Ember.js' },
  ];

  protected frameworksWithDisabled: ZardComboboxOption[] = [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React', disabled: true },
    { value: 'vue', label: 'Vue.js' },
    { value: 'svelte', label: 'Svelte', disabled: true },
    { value: 'ember', label: 'Ember.js' },
  ];

  protected techGroups: ZardComboboxGroup[] = [
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

  // #endregion

  // #region Form Properties

  protected readonly form = this._fb.nonNullable.group({
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

  protected readonly messageLength = signal(0);
  protected readonly showSuccess = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly countries = [
    // { value: '__all__', label: 'All' },
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'br', label: 'Brazil' },
  ] as const;

  protected validationForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    website: new FormControl('', [Validators.pattern(/^https?:\/\/.+/)]),
  });

  protected submitted = false;

  protected profileForm = new FormGroup({
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

  private readonly loginModel = signal({
    username: '',
    email: '',
    password: '',
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

  protected fullName = '';
  protected email = '';
  protected bio = '';

  // #endregion

  // #region Icon Properties

  protected readonly searchQuery = signal('');
  protected readonly iconNames = Object.keys(ZARD_ICONS) as Array<
    keyof typeof ZARD_ICONS
  >;
  protected readonly totalIcons = this.iconNames.length;

  protected readonly filteredIcons = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.iconNames;
    return this.iconNames.filter((iconName) =>
      iconName.toLowerCase().includes(query)
    );
  });

  // #endregion

  // #region Input Group Properties

  protected smallValue = '';
  protected defaultValue = '';
  protected largeValue = '';

  // #endregion

  // #region Pagination Properties

  protected readonly totalPages = 5;
  protected readonly currentPage = signal(3);
  protected readonly pages = signal<number[]>(
    Array.from({ length: this.totalPages }, (_, i) => i + 1)
  );

  // #endregion

  // #region Popover Properties

  protected readonly popoverDirective = viewChild.required('popoverTrigger', {
    read: ZardPopoverDirective,
  });

  protected readonly width = signal('100%');
  protected readonly height = signal('25px');

  protected readonly CURRENCIES = [
    { symbol: '€', code: 'EUR' },
    { symbol: '$', code: 'USD' },
    { symbol: '£', code: 'GBP' },
    { symbol: '¥', code: 'JPY' },
  ];

  protected readonly currency = signal(this.CURRENCIES[1].code);

  // #endregion

  // #region Segmented Properties

  protected selectedValue = '';
  protected readonly selectedValues = signal<string[]>([]);

  protected segmentedOptions2 = [
    { value: 'tab1', label: 'Tab 1' },
    { value: 'tab2', label: 'Tab 2' },
    { value: 'tab3', label: 'Tab 3' },
  ];

  protected optionsWithDisabled = [
    { value: 'enabled1', label: 'Enabled' },
    { value: 'disabled1', label: 'Disabled', disabled: true },
    { value: 'enabled2', label: 'Enabled' },
    { value: 'disabled2', label: 'Disabled', disabled: true },
  ];

  protected options = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'archived', label: 'Archived' },
  ];

  protected val = 'a';
  protected selected = 'default';

  // #endregion

  // #region Sheet Properties

  protected readonly placement = signal<
    'right' | 'left' | 'top' | 'bottom' | null | undefined
  >('right');

  // #endregion

  // #region Table Properties

  protected listOfData: Person[] = [
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

  protected payments: Payment[] = [
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

  // #endregion

  // #region Tabs Properties

  protected zTabsPosition: zPosition = 'top';
  protected zActivePosition: zPosition = 'bottom';
  protected zAlignTabs: zAlign = 'start';

  // #endregion

  // #region Toast Properties

  protected currentPosition:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right' = 'bottom-right';

  // #endregion

  // #region Toggle Properties

  protected items: ZardToggleGroupItem[] = [
    { value: 'bold', icon: 'bold', label: 'Bold', ariaLabel: 'Toggle bold' },
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

  protected lightOn = false;

  // #endregion

  // #region Tooltip Properties

  protected showArrow = true;

  // #endregion

  // #region Lifecycle Hooks

  constructor() {
    // Track message length
    this.form.controls.message.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
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

    if (this._zData) {
      this.form.patchValue(this._zData);
    }
  }

  // #endregion

  // #region Alert Dialog Methods

  /** Alert Dialog: Show confirmation dialog */
  protected showAlertDialog(): void {
    this._alertDialogService.confirm({
      zTitle: 'Are you absolutely sure?',
      zDescription:
        'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
      zOkText: 'Continue',
      zCancelText: 'Cancel',
    });
  }

  // #endregion

  // #region Callout Methods

  /** Callout: Handle action click */
  protected onActionClick(): void {
    alert('Redirect to Sign Up');
  }

  // #endregion

  // #region Calendar Methods

  /** Calendar: Handle date change */
  protected onDateChange(date: Date | null): void {
    this.selectedDate.set(date);
    console.log('Selected date:', date);
  }

  /** Calendar: Handle date change (default size) */
  protected onDateChangeDefault(date: Date | null): void {
    this.selectedDateDefault.set(date);
    console.log('Selected date (default):', date);
  }

  /** Calendar: Handle date change (large size) */
  protected onDateChangeLg(date: Date | null): void {
    this.selectedDateLg.set(date);
    console.log('Selected date (lg):', date);
  }

  /** Calendar: Handle date change (small size) */
  protected onDateChangeSm(date: Date | null): void {
    this.selectedDateSm.set(date);
    console.log('Selected date (sm):', date);
  }

  /** Calendar: Handle dates change */
  protected onDatesChange(date: NonNullable<CalendarValue>): void {
    console.log('Selected date:', date);
  }

  /** Calendar: Format date for display */
  protected formatDate(
    date?: Date[] | null,
    label: 'start' | 'end' = 'start'
  ): string {
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

  // #endregion

  // #region Card Methods

  /** Card: Handle card action click */
  protected onCardActionClick(): void {
    console.log('on Card Action Click');
  }

  // #endregion

  // #region Carousel Methods

  /** Carousel: Handle initialization */
  protected onCarouselInit(api: EmblaCarouselType): void {
    this.carouselApi.set(api);
    this.totalSlides.set(api.scrollSnapList().length);
    this.currentSlide.set(api.selectedScrollSnap() + 1);
    this.update();
  }

  /** Carousel: Handle slide change */
  protected onSlideChange(): void {
    this.currentSlide.set((this.carouselApi()?.selectedScrollSnap() ?? 0) + 1);
    this.update();
  }

  /** Carousel: Handle spacing change */
  protected onChange(value: string): void {
    this.currentSpacing.set(value as 'sm' | 'md' | 'lg' | 'xl');
  }

  /** Carousel: Navigate to next slide */
  protected goToNext(): void {
    this.carouselApi()?.scrollNext();
  }

  /** Carousel: Navigate to previous slide */
  protected goToPrevious(): void {
    this.carouselApi()?.scrollPrev();
  }

  /** Carousel: Navigate to specific slide */
  protected goToSlide(index: number): void {
    this.carouselApi()?.scrollTo(index);
  }

  /** Carousel: Toggle autoplay */
  protected async toggleAutoplay(): Promise<void> {
    this.isAutoplayActive.update((b) => !b);
    if (this.isAutoplayActive()) {
      await this.startAutoplay();
    } else {
      this.pauseAutoplay();
    }
    this.reinitCarousel();
  }

  /** Carousel: Toggle loop */
  protected toggleLoop(): void {
    this.carouselOptions = {
      ...this.carouselOptions,
      loop: !this.carouselOptions.loop,
    };
    this.reinitCarousel();
  }

  /** Carousel: Start autoplay (private) */
  private async startAutoplay(): Promise<void> {
    const autoplayPlugin = await this._pluginsService.createAutoplayPlugin({
      stopOnMouseEnter: true,
      delay: 2000,
      stopOnInteraction: false,
    });
    this.plugins = [
      ...this.plugins.filter((p) => p.name !== 'autoplay'),
      autoplayPlugin,
    ];
  }

  /** Carousel: Pause autoplay (private) */
  private pauseAutoplay(): void {
    this.plugins = this.plugins.filter((p) => p.name !== 'autoplay');
  }

  /** Carousel: Reinitialize carousel (private) */
  private reinitCarousel(): void {
    if (this.carouselApi()) {
      this.carouselApi()?.reInit(this.carouselOptions, this.plugins);
    }
  }

  /** Carousel: Update carousel state (private) */
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

  // #endregion

  // #region Combobox Methods

  /** Combobox: Handle selection */
  protected onSelect(option: ZardComboboxOption): void {
    console.log('Selected:', option);
  }

  /** Combobox: Handle combobox selection */
  protected onComboboxSelect(option: ZardComboboxOption): void {
    console.log('Selected:', option);
  }

  /** Combobox: Set value */
  protected setValue(): void {
    this.frameworkControl.setValue('vue');
  }

  /** Combobox: Clear value */
  protected clearValue(): void {
    this.frameworkControl.setValue(null);
  }

  /** Combobox: Log value */
  protected logValue(): void {
    console.log('Form Control Value:', this.frameworkControl.value);
  }

  // #endregion

  // #region Command Methods

  /** Command: Handle command selection */
  protected handleCommand(option: ZardCommandOption): void {
    const action = `Executed "${option.label}" (value: ${option.value})`;
    console.log(action);

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

  /** Command: Handle keyboard shortcuts */
  protected handleKeydown(event: KeyboardEvent): void {
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

  /** Command: Execute command (private) */
  private executeCommand(value: string, label: string): void {
    this.handleCommand({ value, label } as ZardCommandOption);
  }

  /** Command: Show alert (private) */
  private showAlert(message: string, isWarning = false): void {
    if (isWarning) {
      console.warn(message);
    } else {
      console.log(message);
    }

    setTimeout(() => {
      // You could clear the action after some time
    }, 3000);
  }

  // #endregion

  // #region Dialog Methods

  /** Dialog: Open dialog */
  protected openDialog(): void {
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

  // #endregion

  // #region Dropdown Methods

  /** Dropdown: Handle show event */
  protected onShow(): void {
    this.event = '(zShow)';
  }

  /** Dropdown: Handle hide event */
  protected onHide(): void {
    this.event = '(zHide)';
  }

  /** Dropdown: Log value */
  protected log(value: string): void {
    console.log(value);
  }

  // #endregion

  // #region Form Methods

  /** Form: Check if field is invalid */
  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  /** Form: Get email error message */
  protected getEmailError(): string {
    const email = this.form.get('email');
    if (email?.hasError('required')) {
      return 'Email is required';
    }
    if (email?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  /** Form: Get name control */
  protected get nameControl(): FormControl {
    return this.validationForm.get('name') as FormControl;
  }

  /** Form: Get email control */
  protected get emailControl(): FormControl {
    return this.validationForm.get('email') as FormControl;
  }

  /** Form: Get website control */
  protected get websiteControl(): FormControl {
    return this.validationForm.get('website') as FormControl;
  }

  /** Form: Handle form submission */
  protected async handleSubmit(): Promise<void> {
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

  /** Form: Handle form tree submission */
  protected async onFormTreeSubmit(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.profileFormTree, async (form) => {
      console.log('Form submitted:', form().value());
    });
  }

  /** Form: Handle validation form submission */
  protected onSubmit(): void {
    if (this.validationForm.valid) {
      this.submitted = true;
      console.log('Form submitted:', this.validationForm.value);

      setTimeout(() => {
        this.submitted = false;
      }, 3000);
    }
  }

  /** Form: Handle submission validation */
  protected onSubmitValidation(): void {
    if (this.validationForm.valid) {
      console.log('Form submitted:', this.validationForm.value);
    }
  }

  /** Form: Reset form */
  protected resetForm(): void {
    this.form.reset();
    this.showSuccess.set(false);
    this.messageLength.set(0);
  }

  /** Form: Reset validation */
  protected resetValidation(): void {
    this.validationForm.reset();
    this.submitted = false;
  }

  /** Form: Simulate API call (private) */
  private simulateApiCall(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // #endregion

  // #region Icon Methods

  /** Icon: Handle search change */
  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  /** Icon: Copy icon code */
  protected async copyIconCode(iconName: string): Promise<void> {
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

  // #endregion

  // #region Pagination Methods

  /** Pagination: Navigate to page */
  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }

  /** Pagination: Navigate to previous page */
  protected goToPreviousCustom(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  /** Pagination: Navigate to next page */
  protected goToNextCustom(): void {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.update((p) => p + 1);
    }
  }

  // #endregion

  // #region Popover Methods

  /** Popover: Save changes */
  protected saveChanges(): void {
    console.log('Settings saved:', {
      width: this.width(),
      height: this.height(),
    });
    this.popoverDirective().hide();
  }

  // #endregion

  // #region Segmented Methods

  /** Segmented: Handle selection change */
  protected onSelectionChange(value: string): void {
    console.log('Selected:', value);
  }

  // #endregion

  // #region Sheet Methods

  /** Sheet: Open basic sheet */
  protected openSheetBasic(): void {
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

  /** Sheet: Open custom sheet */
  protected openCustomSheet(): void {
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

  /** Sheet: Open sheet with size */
  protected openSheetSize(): void {
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
      zSide: this.placement(),
    });
  }

  /** Sheet: Open tall sheet */
  protected openTallSheet(): void {
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

  /** Sheet: Open top sheet */
  protected openTopSheet(): void {
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

  /** Sheet: Open wide sheet */
  protected openWideSheet(): void {
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

  // #endregion

  // #region Table Methods

  /** Table: Format currency */
  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /** Table: Get status variant */
  protected getStatusVariant(
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

  /** Table: Copy payment ID */
  protected copyPaymentId(id: string): void {
    navigator.clipboard.writeText(id);
    console.log('Payment ID copied:', id);
  }

  /** Table: View payment details */
  protected viewDetails(payment: Payment): void {
    console.log('View payment details:', payment);
  }

  // #endregion

  // #region Toast Methods

  /** Toast: Show toast */
  protected showToast(): void {
    toast.success('Event created successfully', {
      description: 'Your event has been saved and will start soon.',
    });
  }

  /** Toast: Show toast with loader */
  protected showToastLoader(): void {
    const promise = (): Promise<{ name: string }> =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ name: 'Sonner' }), 2000)
      );

    toast.promise(promise, {
      loading: 'Loading...',
      success: (data) => `${data.name} has been created`,
      error: 'Error',
    });
  }

  /** Toast: Show toast at position */
  protected showToastPosition(
    position:
      | 'top-left'
      | 'top-center'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-center'
      | 'bottom-right'
  ): void {
    this.currentPosition = position;
    toast(`Toast at ${position.replace('-', ' ')}`, {
      action: {
        label: 'Close',
        onClick: () => console.log('Toast closed'),
      },
      position: position,
    });
  }

  /** Toast: Show with action */
  protected showWithAction(): void {
    toast('Event created', {
      description: 'Your event has been saved successfully.',
      action: {
        label: 'View',
        onClick: () => console.log('View clicked'),
      },
    });
  }

  /** Toast: Show with custom duration */
  protected showCustomDuration(): void {
    toast('This toast lasts 8 seconds', {
      description: 'Custom duration example.',
      duration: 8000,
    });
  }

  // #endregion

  // #region Toggle Methods

  /** Toggle: Handle toggle change */
  protected onToggleChange(value: string | string[]): void {
    console.log('Selected formatting:', value);
  }

  // #endregion
}
