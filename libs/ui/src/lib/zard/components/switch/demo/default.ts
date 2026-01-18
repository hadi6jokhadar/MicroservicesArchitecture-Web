import { Component } from '@angular/core';

import { ZardSwitchComponent } from '../switch.component';

@Component({
  selector: 'z-demo-switch',
  imports: [ZardSwitchComponent],
  standalone: true,
  template: ` <z-switch /> `,
})
export class ZardDemoSwitchDefaultComponent {}
