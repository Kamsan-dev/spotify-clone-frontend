import { Location } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { filter, Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { State } from '../model/state.mode';
import { User } from '../model/user.model';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public http = inject(HttpClient);
  public router = inject(Router);

  public location = inject(Location);

  private auth0Service = inject(Auth0Service);

  public notConnected = 'NOT_CONNECTED';

  private fetchUser$: WritableSignal<State<User>> = signal(State.Builder<User>().forSuccess({ email: this.notConnected }));
  public fetchUser = computed(() => this.fetchUser$());

  public accessToken: string | undefined = undefined;

  /* Get info of the authenticated user */
  public fetchUserData(forceResync: boolean): void {
    this.fetchHttpUser(forceResync).subscribe({
      next: (user: User) => this.fetchUser$.set(State.Builder<User>().forSuccess(user)),
      error: (error: HttpErrorResponse) => {
        // 401 status code : unauthenticated
        if (error.status === HttpStatusCode.Unauthorized && this.isAuthenticated()) {
          this.fetchUser$.set(State.Builder<User>().forSuccess({ email: this.notConnected }));
        } else {
          this.fetchUser$.set(State.Builder<User>().forError(error));
        }
      },
    });
  }

  login(): void {
    this.auth0Service.loginWithRedirect();
  }

  renewAccessToken(): void {
    this.auth0Service.getAccessTokenSilently({ cacheMode: 'off' }).subscribe((token) => {
      this.accessToken = token;
      this.fetchUserData(true);
    });
  }

  initAuthentication(): void {
    this.auth0Service.isAuthenticated$
      .pipe(
        filter((isLoggedIn) => isLoggedIn),
        switchMap(() => this.auth0Service.getAccessTokenSilently())
      )
      .subscribe((token) => {
        this.accessToken = token;
        this.fetchUserData(false);
      });
  }

  logout(): void {
    this.auth0Service.logout();
    this.router.navigate(['/login']);
  }

  public isAuthenticated(): boolean {
    if (this.fetchUser$().value) {
      return this.fetchUser$().value!.email !== this.notConnected;
    } else return false;
  }

  /** HTTP CALLS  **/

  public fetchHttpUser(forceResync: boolean): Observable<User> {
    return this.http.get<User>(`${environment.API_URL}/auth/get-authenticated-user?forceResync=${forceResync}`);
  }
}
