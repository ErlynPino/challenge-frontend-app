import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ENVIRONMENT } from '../../tokens/environment.token';
import { LoggerService } from '../services/logger.service';

/**
 * ApiInterceptor – functional HTTP interceptor (Angular 15+ API).
 *
 * Responsibilities:
 *  1. Prepend the API base URL to every outgoing request.
 *  2. Add Authorization header when an auth token is present (placeholder).
 *  3. Centralize error logging and rethrow for component-level handling.
 *
 * Decision: functional interceptors (HttpInterceptorFn) over class-based
 * ones because they align with the standalone/functional Angular model,
 * allow direct use of inject(), and require no extra provider boilerplate.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(ENVIRONMENT);
  const logger = inject(LoggerService);

  // 1. Prepend base URL only for relative URLs (skip absolute URLs like assets)
  const isRelative = !req.url.startsWith('http');
  const apiReq = isRelative
    ? req.clone({ url: `${env.apiUrl}${req.url}` })
    : req;

  // 2. Auth token placeholder – uncomment when auth is introduced:
  // const token = inject(AuthService).token();
  // if (token) {
  //   apiReq = apiReq.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  // }

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      logger.error(`HTTP ${error.status} on ${req.url}`, error.message);
      return throwError(() => error);
    }),
  );
};
