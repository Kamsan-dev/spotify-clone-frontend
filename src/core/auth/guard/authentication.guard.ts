import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { AuthService } from '../service/auth.service';

export const authenticationGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const route = inject(Router);
  const auth0Service = inject(Auth0Service);
  const connectedUser = authService.fetchUser().value;

  if ((authService.isAuthenticated() && connectedUser) || authService.accessToken !== undefined) {
    return true;
  } else {
    route.navigateByUrl('/login');
    return false;
  }
};
