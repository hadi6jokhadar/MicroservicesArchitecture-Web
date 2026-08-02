import { Component } from '@angular/core';
import { LoginComponent } from '@ihsan/shared';

@Component({
  selector: 'app-polysnap-login',
  standalone: true,
  imports: [LoginComponent],
  template: `<shared-login
    [showModes]="false"
    [showForgotPassword]="true"
    [showCreateAccount]="false"
    [redirectAfterLogin]="'/dashboard'"
  />`,
})
export class PolysnapLoginComponent {}
