// src/app/guards/role.guard.ts
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../_services/auth/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role']; // Get required role from route data
  const userRole = authService.getUserRole(); // Assume getUserRole() returns 'USER' or 'ADMIN'

  if (userRole === requiredRole) {
    return true;
  } else {
    router.navigate(['/forbidden']); // Redirect to home page or an unauthorized page
    return false;
  }
};