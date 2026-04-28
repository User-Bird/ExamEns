import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // For json-server we don't need a token, but we can attach user info
  const auth = inject(AuthService);
  const user = auth.currentUser();

  if (user) {
    const cloned = req.clone({
      setHeaders: { 'X-User-Id': String(user.id), 'X-User-Role': user.role }
    });
    return next(cloned);
  }

  return next(req);
};
