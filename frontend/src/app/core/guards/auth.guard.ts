import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const TOKEN_KEY = 'talentflow_token';
const USER_KEY = 'talentflow_user';

function getStoredUser() {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

function isLoggedIn(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  if (isLoggedIn()) {
    return true;
  }
  
  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  if (!isLoggedIn()) {
    return true;
  }
  
  return router.createUrlTree(['/dashboard']);
};

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const user = getStoredUser();
  
  if (user?.role === 'ADMIN') {
    return true;
  }
  
  return router.createUrlTree(['/dashboard']);
};

export const hrGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const user = getStoredUser();
  
  if (user?.role === 'ADMIN' || user?.role === 'HR') {
    return true;
  }
  
  return router.createUrlTree(['/dashboard']);
};
