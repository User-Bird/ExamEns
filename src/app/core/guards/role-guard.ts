import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data['roles'] ?? [];
  const userRole = auth.userRole();

  if (userRole && allowedRoles.includes(userRole)) return true;

  // Redirect to their correct area instead of login
  if (userRole) {
    auth.redirectByRole(userRole as any);
    return false;
  }

  router.navigate(['/login']);
  return false;
};
