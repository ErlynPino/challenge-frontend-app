import { Injectable, inject } from '@angular/core';
import { ENVIRONMENT } from '../../tokens/environment.token';

/**
 * LoggerService – wraps console methods and silences output in production.
 *
 * Decision: a thin wrapper is enough for this domain size.
 * If structured logging (e.g. Datadog/Sentry) were needed, only this
 * service would change — consumers stay untouched (Open/Closed Principle).
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly env = inject(ENVIRONMENT);

  log(message: string, ...args: unknown[]): void {
    if (!this.env.production) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (!this.env.production) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    // Errors are always logged (production monitoring)
    console.error(`[ERROR] ${message}`, ...args);
  }
}
