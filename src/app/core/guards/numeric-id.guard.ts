import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

/**
 * Validates that the `:id` route param is a positive integer.
 * Redirects to /users if the param is missing, non-numeric or ≤ 0.
 */
export const numericIdGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const id = route.paramMap.get('id');
  const parsed = Number(id);

  if (id && Number.isInteger(parsed) && parsed > 0) {
    return true;
  }

  return router.createUrlTree(['/users']);
};
