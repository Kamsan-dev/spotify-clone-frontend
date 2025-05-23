import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { filter, switchMap, take } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private auth0Service = inject(Auth0Service);
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit(): void {
    this.auth0Service.isAuthenticated$
      .pipe(
        filter((isLoggedIn) => isLoggedIn),
        switchMap(() => this.auth0Service.getAccessTokenSilently())
      )
      .subscribe((token) => {
        this.authService.accessToken = token;
        this.authService.fetchUserData(false);
        this.router.navigate(['']); // Redirect to home if already logged in
      });
  }
}
