import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ENVIRONMENT } from '../../tokens/environment.token';
import { LoggerService } from '../services/logger.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(ENVIRONMENT);
  const logger = inject(LoggerService);

  const apiReq = !req.url.startsWith('http')
    ? req.clone({ url: `${env.apiUrl}${req.url}` })
    : req;

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      logger.error(`HTTP ${error.status} on ${req.url}`, error.message);
      return throwError(() => error);
    }),
  );
};
