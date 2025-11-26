import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { IdentityUserService } from './user.service';
import { IUser } from './models';

export const profileResolver: ResolveFn<IUser> = () => {
  return inject(IdentityUserService).getProfile();
};
