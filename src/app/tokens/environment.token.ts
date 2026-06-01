import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  production: boolean;
  apiUrl: string;
}

/**
 * ENVIRONMENT injection token.
 *
 * Using an InjectionToken instead of importing environment.ts directly
 * in services/interceptors keeps them decoupled from the file system
 * and makes unit testing trivial (just provide a mock value).
 */
export const ENVIRONMENT = new InjectionToken<EnvironmentConfig>('ENVIRONMENT');
