import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { MessageService, ConfirmationService } from 'primeng/api';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { ENVIRONMENT } from './tokens/environment.token';
import { apiInterceptor } from './core/interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiInterceptor])),
    
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
          cssLayer: { name: 'primeng', order: 'tailwind-base, primeng, app' },
        },
      },
      ripple: true,
    }),
    { provide: ENVIRONMENT, useValue: environment },
    MessageService,
    ConfirmationService,
  ],
};
