import { Component } from '@angular/core';
import { RegisterComponent } from '@ihsan/shared';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [RegisterComponent],
  template: `<shared-register
    [showModes]="true"
    [showLoginLink]="true"
    [redirectAfterRegister]="'/dashboard'"
  />`,
})
export class AdminRegisterComponent {}
