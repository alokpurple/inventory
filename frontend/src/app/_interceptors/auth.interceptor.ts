import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../_services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken(); // Assume this method returns the JWT token or null

  // Check for 'No-Auth' header to skip token attachment
  const shouldSkipAuth = req.headers.has('No-Auth') && req.headers.get('No-Auth') === 'True';

  // Debugging log to confirm token and request header status
  console.log(`Request URL: ${req.url}`, { shouldSkipAuth, token });

  // Clone the request to add the Authorization header if token is available and No-Auth header is absent
  const authReq = shouldSkipAuth || !token
    ? req
    : req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

  // Debugging log to confirm if token was attached
  if (!shouldSkipAuth && token) {
    console.log(`Token attached for request to ${req.url}`);
  }

  return next(authReq);
};
