import { ZardDropdownMenuItemComponent } from './dropdown-item.component';
import { ZardDropdownMenuContentComponent } from './dropdown-menu-content.component';
import { ZardDropdownDirective } from './dropdown-trigger.directive';
import { ZardDropdownMenuComponent } from './dropdown.component';
import { ZardMenuLabelComponent } from '../menu';

export const ZardDropdownImports = [
  ZardDropdownMenuComponent,
  ZardDropdownMenuItemComponent,
  ZardMenuLabelComponent,
  ZardDropdownMenuContentComponent,
  ZardDropdownDirective,
] as const;
