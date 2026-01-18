import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

// Accordion Demos
import {
  ZardButtonComponent,
  ZardDemoAccordionBasicComponent,
  ZardDemoAccordionMultipleComponent,
  ZardDemoAccordionMultipleLastNotCollapsibleComponent,
  ZardDemoDialogBasicInputComponent,
  ZardDemoSheetBasicInputComponent,
  ZardDemoSheetSideInputComponent,
  ZardDialogService,
  ZardIconComponent,
  ZardSheetService,
} from '@ihsan/ui';

// Alert Demos
import { ZardDemoAlertBasicComponent } from '@ihsan/ui';

// Alert Dialog Demos
import { ZardDemoAlertDialogDefaultComponent } from '@ihsan/ui';

// Avatar Demos
import {
  ZardDemoAvatarBasicComponent,
  ZardDemoAvatarStatusComponent,
} from '@ihsan/ui';

// Badge Demos
import { ZardDemoBadgeDefaultComponent } from '@ihsan/ui';

// Breadcrumb Demos
import {
  ZardDemoBreadcrumbDefaultComponent,
  ZardDemoBreadcrumbEllipsisComponent,
  ZardDemoBreadcrumbSeparatorComponent,
} from '@ihsan/ui';

// Button Demos
import {
  ZardDemoButtonDefaultComponent,
  ZardDemoButtonFullComponent,
  ZardDemoButtonLinkComponent,
  ZardDemoButtonLoadingComponent,
  ZardDemoButtonShapeComponent,
  ZardDemoButtonSizeComponent,
  ZardDemoButtonTypeComponent,
} from '@ihsan/ui';

// Button Group Demos
import {
  ZardDemoButtonGroupDefaultComponent,
  ZardDemoButtonGroupDividerComponent,
  ZardDemoButtonGroupInputComponent,
  ZardDemoButtonGroupNestedComponent,
  ZardDemoButtonGroupOrientationComponent,
  ZardDemoButtonGroupSelectComponent,
  ZardDemoButtonGroupSizeComponent,
} from '@ihsan/ui';

// Calendar Demos
import {
  ZardDemoCalendarDefaultComponent,
  ZardDemoCalendarExpandYearSelectionRangeComponent,
  ZardDemoCalendarMultipleComponent,
  ZardDemoCalendarRangeComponent,
  ZardDemoCalendarWithConstraintsComponent,
} from '@ihsan/ui';

// Card Demos
import { ZardDemoCardDefaultComponent } from '@ihsan/ui';

// Carousel Demos
import {
  ZardDemoCarouselApiComponent,
  ZardDemoCarouselDefaultComponent,
  ZardDemoCarouselDotControlsComponent,
  ZardDemoCarouselOrientationComponent,
  ZardDemoCarouselPluginsComponent,
  ZardDemoCarouselSizeComponent,
  ZardDemoCarouselSpacingComponent,
} from '@ihsan/ui';

// Checkbox Demos
import {
  ZardDemoCheckboxDefaultComponent,
  ZardDemoCheckboxDestructiveComponent,
  ZardDemoCheckboxDisabledComponent,
  ZardDemoCheckboxShapeComponent,
  ZardDemoCheckboxSizeComponent,
} from '@ihsan/ui';

// Combobox Demos
import {
  ZardDemoComboboxDefaultComponent,
  ZardDemoComboboxDisabledComponent,
  ZardDemoComboboxFormComponent,
  ZardDemoComboboxGroupedComponent,
} from '@ihsan/ui';

// Command Demos
import { ZardDemoCommandDefaultComponent } from '@ihsan/ui';

// Date Picker Demos
import {
  ZardDemoDatePickerDefaultComponent,
  ZardDemoDatePickerSizesComponent,
} from '@ihsan/ui';

// Divider Demos
import {
  ZardDemoDividerDefaultComponent,
  ZardDemoDividerVerticalComponent,
} from '@ihsan/ui';

// Empty Demos
import {
  ZardDemoEmptyAdvancedComponent,
  ZardDemoEmptyCustomImageComponent,
  ZardDemoEmptyDefaultComponent,
} from '@ihsan/ui';

// Form Demos
import {
  ZardDemoFormComplexComponent,
  ZardDemoFormDefaultComponent,
  ZardDemoFormReactiveComponent,
  ZardDemoFormSignalComponent,
  ZardDemoFormValidationComponent,
} from '@ihsan/ui';

// Icon Demos
import {
  ZardDemoIconColorsComponent,
  ZardDemoIconDefaultComponent,
  ZardDemoIconSearchableComponent,
  ZardDemoIconSizesComponent,
  ZardDemoIconStrokeWidthComponent,
} from '@ihsan/ui';

// Input Demos
import {
  ZardDemoInputBorderlessComponent,
  ZardDemoInputDefaultComponent,
  ZardDemoInputSizeComponent,
  ZardDemoInputStatusComponent,
  ZardDemoInputTextAreaComponent,
} from '@ihsan/ui';

// Input Group Demos
import {
  ZardDemoInputGroupBorderlessComponent,
  ZardDemoInputGroupDefaultComponent,
  ZardDemoInputGroupLoadingComponent,
  ZardDemoInputGroupSizeComponent,
  ZardDemoInputGroupTextComponent,
} from '@ihsan/ui';

// Kbd Demos
import {
  ZardDemoKbdDefaultComponent,
  ZardDemoKbdGroupComponent,
  ZardDemoKbdTooltipComponent,
} from '@ihsan/ui';

// Loader Demos
import {
  ZardDemoLoaderBasicComponent,
  ZardDemoLoaderDefaultComponent,
  ZardDemoLoaderSizeComponent,
} from '@ihsan/ui';

// Menu Demos
import { ZardDemoMenuDefaultComponent } from '@ihsan/ui';

// Pagination Demos
import {
  ZardDemoPaginationCustomComponent,
  ZardDemoPaginationDefaultComponent,
} from '@ihsan/ui';

// Popover Demos
import {
  ZardDemoPopoverDefaultComponent,
  ZardDemoPopoverHoverComponent,
  ZardDemoPopoverInteractiveComponent,
  ZardDemoPopoverPlacementComponent,
} from '@ihsan/ui';

// Progress Bar Demos
import {
  ZardDemoProgressBarBasicComponent,
  ZardDemoProgressBarIndeterminateComponent,
  ZardDemoProgressBarShapeComponent,
  ZardDemoProgressBarSizeComponent,
} from '@ihsan/ui';

// Radio Demos
import {
  ZardDemoRadioDefaultComponent,
  ZardDemoRadioDisabledComponent,
} from '@ihsan/ui';

// Resizable Demos
import {
  ZardDemoResizableDefaultComponent,
  ZardDemoResizableVerticalComponent,
  ZardDemoResizableWithMinMaxComponent,
} from '@ihsan/ui';

// Segmented Demos
import {
  ZardDemoSegmentedDefaultComponent,
  ZardDemoSegmentedDisabledComponent,
  ZardDemoSegmentedSizesComponent,
} from '@ihsan/ui';

// Select Demos
import {
  ZardDemoMultiSelectBasicComponent,
  ZardDemoSelectBasicComponent,
} from '@ihsan/ui';

// Sheet Demos

// Skeleton Demos
import {
  ZardDemoSkeletonCardComponent,
  ZardDemoSkeletonDefaultComponent,
} from '@ihsan/ui';

// Slider Demos
import {
  ZardDemoSliderDefaultComponent,
  ZardDemoSliderDisabledComponent,
  ZardDemoSliderMinMaxComponent,
  ZardDemoSliderVerticalComponent,
} from '@ihsan/ui';

// Switch Demos
import {
  ZardDemoSwitchBasicComponent,
  ZardDemoSwitchDefaultComponent,
  ZardDemoSwitchDestructiveComponent,
  ZardDemoSwitchDisabledComponent,
  ZardDemoSwitchSizeComponent,
} from '@ihsan/ui';

// Table Demos
import {
  ZardDemoTablePaymentsComponent,
  ZardDemoTableSimpleComponent,
} from '@ihsan/ui';

// Tabs Demos
import {
  ZardDemoTabsAlignComponent,
  ZardDemoTabsArrowComponent,
  ZardDemoTabsDefaultComponent,
  ZardDemoTabsPositionComponent,
} from '@ihsan/ui';

// Toast Demos
import {
  ZardDemoToastAdvancedComponent,
  ZardDemoToastDefaultComponent,
  ZardDemoToastDestructiveComponent,
  ZardDemoToastLoadingComponent,
  ZardDemoToastPositionComponent,
  ZardDemoToastSuccessComponent,
} from '@ihsan/ui';

// Toggle Demos
import {
  ZardDemoToggleDefaultComponent,
  ZardDemoToggleDisabledComponent,
  ZardDemoToggleLargeComponent,
  ZardDemoToggleOutlineComponent,
  ZardDemoToggleSmallComponent,
  ZardDemoToggleWithDefaultComponent,
  ZardDemoToggleWithFormsComponent,
  ZardDemoToggleWithTextComponent,
} from '@ihsan/ui';

// Tooltip Demos
import {
  ZardDemoTooltipClickComponent,
  ZardDemoTooltipEventsComponent,
  ZardDemoTooltipHoverComponent,
  ZardDemoTooltipPositionComponent,
} from '@ihsan/ui';

@Component({
  selector: 'app-test-components',
  imports: [
    CommonModule,
    // Accordion
    ZardDemoAccordionBasicComponent,
    ZardDemoAccordionMultipleComponent,
    ZardDemoAccordionMultipleLastNotCollapsibleComponent,
    // Alert
    ZardDemoAlertBasicComponent,
    // Alert Dialog
    ZardDemoAlertDialogDefaultComponent,
    // Avatar
    ZardDemoAvatarBasicComponent,
    ZardDemoAvatarStatusComponent,
    // Badge
    ZardDemoBadgeDefaultComponent,
    // Breadcrumb
    ZardDemoBreadcrumbDefaultComponent,
    ZardDemoBreadcrumbSeparatorComponent,
    ZardDemoBreadcrumbEllipsisComponent,
    // Button
    ZardDemoButtonDefaultComponent,
    ZardDemoButtonFullComponent,
    ZardDemoButtonLinkComponent,
    ZardDemoButtonLoadingComponent,
    ZardDemoButtonShapeComponent,
    ZardDemoButtonSizeComponent,
    ZardDemoButtonTypeComponent,
    // Button Group
    ZardDemoButtonGroupDefaultComponent,
    ZardDemoButtonGroupDividerComponent,
    ZardDemoButtonGroupInputComponent,
    ZardDemoButtonGroupOrientationComponent,
    ZardDemoButtonGroupSizeComponent,
    ZardDemoButtonGroupSelectComponent,
    ZardDemoButtonGroupNestedComponent,
    // Calendar
    ZardDemoCalendarDefaultComponent,
    ZardDemoCalendarRangeComponent,
    ZardDemoCalendarMultipleComponent,
    ZardDemoCalendarExpandYearSelectionRangeComponent,
    ZardDemoCalendarWithConstraintsComponent,
    // Card
    ZardDemoCardDefaultComponent,
    // Carousel
    ZardDemoCarouselDefaultComponent,
    ZardDemoCarouselOrientationComponent,
    ZardDemoCarouselDotControlsComponent,
    ZardDemoCarouselApiComponent,
    ZardDemoCarouselPluginsComponent,
    ZardDemoCarouselSizeComponent,
    ZardDemoCarouselSpacingComponent,
    // Checkbox
    ZardDemoCheckboxDefaultComponent,
    ZardDemoCheckboxDestructiveComponent,
    ZardDemoCheckboxDisabledComponent,
    ZardDemoCheckboxShapeComponent,
    ZardDemoCheckboxSizeComponent,
    // Combobox
    ZardDemoComboboxDefaultComponent,
    ZardDemoComboboxDisabledComponent,
    ZardDemoComboboxFormComponent,
    ZardDemoComboboxGroupedComponent,
    // Command
    ZardDemoCommandDefaultComponent,
    // Date Picker
    ZardDemoDatePickerDefaultComponent,
    ZardDemoDatePickerSizesComponent,
    // Divider
    ZardDemoDividerDefaultComponent,
    ZardDemoDividerVerticalComponent,
    // Empty
    ZardDemoEmptyDefaultComponent,
    ZardDemoEmptyCustomImageComponent,
    ZardDemoEmptyAdvancedComponent,
    // Form
    ZardDemoFormDefaultComponent,
    ZardDemoFormReactiveComponent,
    ZardDemoFormSignalComponent,
    ZardDemoFormValidationComponent,
    ZardDemoFormComplexComponent,
    // Icon
    ZardDemoIconDefaultComponent,
    ZardDemoIconColorsComponent,
    ZardDemoIconSizesComponent,
    ZardDemoIconStrokeWidthComponent,
    ZardDemoIconSearchableComponent,
    // Input
    ZardDemoInputDefaultComponent,
    ZardDemoInputSizeComponent,
    ZardDemoInputStatusComponent,
    ZardDemoInputTextAreaComponent,
    ZardDemoInputBorderlessComponent,
    // Input Group
    ZardDemoInputGroupDefaultComponent,
    ZardDemoInputGroupBorderlessComponent,
    ZardDemoInputGroupLoadingComponent,
    ZardDemoInputGroupSizeComponent,
    ZardDemoInputGroupTextComponent,
    // Kbd
    ZardDemoKbdDefaultComponent,
    ZardDemoKbdGroupComponent,
    ZardDemoKbdTooltipComponent,
    // Loader
    ZardDemoLoaderDefaultComponent,
    ZardDemoLoaderBasicComponent,
    ZardDemoLoaderSizeComponent,
    // Menu
    ZardDemoMenuDefaultComponent,
    // Pagination
    ZardDemoPaginationDefaultComponent,
    ZardDemoPaginationCustomComponent,
    // Popover
    ZardDemoPopoverDefaultComponent,
    ZardDemoPopoverHoverComponent,
    ZardDemoPopoverPlacementComponent,
    ZardDemoPopoverInteractiveComponent,
    // Progress Bar
    ZardDemoProgressBarBasicComponent,
    ZardDemoProgressBarIndeterminateComponent,
    ZardDemoProgressBarShapeComponent,
    ZardDemoProgressBarSizeComponent,
    // Radio
    ZardDemoRadioDefaultComponent,
    ZardDemoRadioDisabledComponent,
    // Resizable
    ZardDemoResizableDefaultComponent,
    ZardDemoResizableVerticalComponent,
    ZardDemoResizableWithMinMaxComponent,
    // Segmented
    ZardDemoSegmentedDefaultComponent,
    ZardDemoSegmentedDisabledComponent,
    ZardDemoSegmentedSizesComponent,
    // Select
    ZardDemoSelectBasicComponent,
    ZardDemoMultiSelectBasicComponent,
    // Skeleton
    ZardDemoSkeletonDefaultComponent,
    ZardDemoSkeletonCardComponent,
    // Slider
    ZardDemoSliderDefaultComponent,
    ZardDemoSliderDisabledComponent,
    ZardDemoSliderVerticalComponent,
    ZardDemoSliderMinMaxComponent,
    // Switch
    ZardDemoSwitchDefaultComponent,
    ZardDemoSwitchBasicComponent,
    ZardDemoSwitchDestructiveComponent,
    ZardDemoSwitchDisabledComponent,
    ZardDemoSwitchSizeComponent,
    // Table
    ZardDemoTableSimpleComponent,
    ZardDemoTablePaymentsComponent,
    // Tabs
    ZardDemoTabsDefaultComponent,
    ZardDemoTabsAlignComponent,
    ZardDemoTabsArrowComponent,
    ZardDemoTabsPositionComponent,
    // Toast
    ZardDemoToastDefaultComponent,
    ZardDemoToastAdvancedComponent,
    ZardDemoToastDestructiveComponent,
    ZardDemoToastLoadingComponent,
    ZardDemoToastPositionComponent,
    ZardDemoToastSuccessComponent,
    // Toggle
    ZardDemoToggleDefaultComponent,
    ZardDemoToggleDisabledComponent,
    ZardDemoToggleLargeComponent,
    ZardDemoToggleOutlineComponent,
    ZardDemoToggleSmallComponent,
    ZardDemoToggleWithDefaultComponent,
    ZardDemoToggleWithFormsComponent,
    ZardDemoToggleWithTextComponent,
    // Tooltip
    ZardDemoTooltipClickComponent,
    ZardDemoTooltipEventsComponent,
    ZardDemoTooltipHoverComponent,
    ZardDemoTooltipPositionComponent,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  templateUrl: './test-components.component.html',
  styleUrls: ['./test-components.component.scss'],
})
export class TestComponentsComponent {
  private dialogService = inject(ZardDialogService);
  private sheetService = inject(ZardSheetService);

  protected readonly placement = signal<
    'right' | 'left' | 'top' | 'bottom' | null | undefined
  >('right');

  openDialog() {
    this.dialogService.create({
      zTitle: 'Edit Profile',
      zDescription: `Make changes to your profile here. Click save when you're done.`,
      zContent: ZardDemoDialogBasicInputComponent,
      zData: {
        name: 'Samuel Rizzon',
        username: '@samuelrizzondev',
        region: 'america',
      },
      zOkText: 'Save changes',
      zOnOk: (instance) => {
        console.log('Form submitted:', instance.form.value);
      },
      zWidth: '425px',
    });
  }

  openSheetBasic() {
    this.sheetService.create({
      zTitle: 'Edit profile',
      zDescription: `Make changes to your profile here. Click save when you're done.`,
      zContent: ZardDemoSheetBasicInputComponent,
      zData: {
        name: 'Matheus Ribeiro',
        username: '@ribeiromatheus.dev',
      },
      zOkText: 'Save changes',
      zOnOk: (instance) => {
        console.log('Form submitted:', instance.form.value);
      },
    });
  }
  openWideSheet() {
    this.sheetService.create({
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
    this.sheetService.create({
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
    this.sheetService.create({
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
    this.sheetService.create({
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

  openSheetSize() {
    this.sheetService.create({
      zTitle: 'Edit profile',
      zDescription: `Make changes to your profile here. Click save when you're done.`,
      zContent: ZardDemoSheetSideInputComponent,
      zData: {
        name: 'Matheus Ribeiro',
        username: '@ribeiromatheus.dev',
      },
      zOkText: 'Save changes',
      zOnOk: (instance) => {
        console.log('Form submitted:', instance.form.value);
      },
      zSide: this.placement(),
    });
  }
}
