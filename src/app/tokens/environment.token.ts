import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  production: boolean;
  apiUrl: string;
}

export const ENVIRONMENT = new InjectionToken<EnvironmentConfig>('ENVIRONMENT');
