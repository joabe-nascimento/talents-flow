import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

const TOKEN_KEY = 'talentflow_token';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      if (Date.now() < expiry) {
        return true;
      }
    } catch (e) {
      // Invalid token
    }
  }

  // Not logged in or token expired, redirect to login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const publicGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      if (Date.now() < expiry) {
        // Already logged in, redirect to dashboard
        router.navigate(['/dashboard']);
        return false;
      }
    } catch (e) {
      // Invalid token, allow access to public route
    }
  }

  return true;
};



