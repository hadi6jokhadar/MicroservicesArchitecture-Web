import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TenantService } from './tenant.service';
import { ITenant } from './models';

export const tenantResolver: ResolveFn<ITenant[]> = (): Observable<
  ITenant[]
> => {
  const tenantService = inject(TenantService);
  return tenantService.getAllActiveTenants().pipe(map((res) => res.items));
};
