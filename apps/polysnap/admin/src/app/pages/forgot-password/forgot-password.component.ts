import { Component } from '@angular/core';
import { ForgotPasswordComponent } from '@ihsan/shared';

@Component({
  selector: 'app-polysnap-forgot-password',
  standalone: true,
  imports: [ForgotPasswordComponent],
  template: `<shared-forgot-password
    [showBackToLogin]="true"
    [redirectAfterSuccess]="'/login'"
  />`,
})
export class PolysnapForgotPasswordComponent {}
