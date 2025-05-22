import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideAuth0 } from '@auth0/auth0-angular';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from '../core/auth/interceptor/http-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor]), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })),
    provideAuth0({
      domain: environment.AUTH0_DOMAIN,
      clientId: environment.AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: `${environment.AUTH0_DOMAIN}/api/v2/`,
        scope: `openid profile email read:current_user`,
      },
    }),
  ],
};
