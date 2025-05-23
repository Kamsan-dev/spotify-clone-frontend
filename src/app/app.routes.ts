import { Routes } from '@angular/router';
import { LoginComponent } from '../core/auth/components/login/login.component';
import { HomeComponent } from './home/home.component';
import { authenticationGuard } from '../core/auth/guard/authentication.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
];
