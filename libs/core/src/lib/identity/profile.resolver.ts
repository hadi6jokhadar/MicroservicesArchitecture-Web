import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from './user.service';
import { IUser } from './models';

export const profileResolver: ResolveFn<IUser> = () => {
  return inject(UserService).getProfile();
};
