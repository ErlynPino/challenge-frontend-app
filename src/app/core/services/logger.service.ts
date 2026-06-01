import { Injectable, inject } from '@angular/core';
import { ENVIRONMENT } from '../../tokens/environment.token';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly env = inject(ENVIRONMENT);

  log(message: string, ...args: unknown[]): void {
    if (!this.env.production) console.log(`[LOG] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    if (!this.env.production) console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }
}
