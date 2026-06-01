# Prompt 01 — Project Setup & Configuration

## Context
Angular 21 workspace generated with Angular CLI. Need to wire Vitest, Tailwind CSS 4, PrimeNG 21, and a clean architecture before writing any feature code.

## Prompt

```
Act as a senior Angular tech lead. I have a freshly generated Angular 21 workspace.

Configure the following:
1. Replace Karma/Jasmine with Vitest using the @angular/build:unit-test builder. Update angular.json and tsconfig.spec.json accordingly. Add "types": ["vitest/globals"] so describe/it/expect are available without imports.
2. Wire Tailwind CSS 4 via @tailwindcss/vite plugin in angular.json vite plugins. Add @layer tailwind-base, primeng, app to styles.scss.
3. Add PrimeNG 21 with Aura theme. Configure providePrimeNG in app.config.ts with darkModeSelector: false and cssLayer ordering.
4. Create an ENVIRONMENT InjectionToken (not a filesystem import) with { production, apiUrl } shape. Provide it in app.config.ts.
5. Create a LoggerService that silences console in production, always logs errors.
6. Create a functional apiInterceptor that prepends the base URL from ENVIRONMENT and logs HTTP errors via LoggerService.

Constraints: standalone components only, no NgModules, no zone.js assumptions. Keep code clean with no excessive comments.
```

## Key Decisions Made
- `InjectionToken<EnvironmentConfig>` over direct environment file import — decouples services from filesystem path
- `@layer tailwind-base, primeng, app` order prevents PrimeNG styles from being overridden by Tailwind reset
- Vitest `globals: true` in tsconfig avoids `import { describe } from 'vitest'` boilerplate in every spec
