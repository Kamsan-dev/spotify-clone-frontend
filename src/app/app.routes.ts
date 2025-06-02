import { Routes } from '@angular/router';
import { LoginComponent } from '../core/auth/components/login/login.component';
import { HomeComponent } from './home/home.component';
import { authenticationGuard } from '../core/auth/guard/authentication.guard';
import { PlaylistViewComponent } from './layout/components/playlist-view/playlist-view.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'playlist',
    component: PlaylistViewComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
];
