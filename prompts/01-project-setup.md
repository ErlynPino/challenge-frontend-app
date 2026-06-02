# Prompt 01 — Project Setup & Configuración inicial

## Objetivo de la sesión

Tener la base del proyecto lista antes de escribir una línea de feature code: Vitest en lugar de Karma, Tailwind CSS 4, PrimeNG 21 con tema Aura, y la arquitectura de inyección de dependencias limpia.

---

## Prompt inicial

```
Tengo un workspace Angular 21 recién generado con Angular CLI.
Necesito configurar:
- Vitest en lugar de Karma/Jasmine (builder @angular/build:unit-test)
- Tailwind CSS 4 vía @tailwindcss/vite
- PrimeNG 21 con tema Aura
- Un mecanismo de configuración para la API URL que no dependa de imports de filesystem

¿Cuál sería el orden de configuración y qué archivos debo tocar?
```

_El primer prompt lo hice abierto a propósito — quería ver qué approach proponía antes de condicionarlo._

---

## Prompt de seguimiento (después de revisar la respuesta)

```
Bien. Para el tema del environment, la IA propuso importar environment.ts directamente
en los servicios. No quiero eso — si cambio la ruta del archivo se rompen todos los imports.
Usá un InjectionToken<EnvironmentConfig> con shape { production: boolean, apiUrl: string }.
Proveerlo en app.config.ts con useValue: environment.

También necesito:
- LoggerService que en producción solo loguee errors (log/warn silenciados)
- apiInterceptor funcional (no clase) que prepend la baseUrl del token y loguee HTTP errors

Constraints: solo standalone components, sin NgModules, sin asumir zone.js.
```

---

## Prompt de ajuste (tercer round)

```
El interceptor que generaste usa constructor injection en una clase. Cámbialo
a una función HttpInterceptorFn que use inject(). Más limpio con Angular moderno.
```

---

## Qué acepté

- La estructura de `tsconfig.spec.json` con `"types": ["vitest/globals"]` — me ahorró investigar la config exacta
- La configuración de `@layer tailwind-base, primeng, app` en `styles.scss` — la IA explicó bien por qué el orden importa para que PrimeNG no pise el reset de Tailwind
- El `providePrimeNG` con `cssLayer` — yo no conocía ese parámetro en PrimeNG 21

## Qué descartué

- El import directo de `environment.ts` en los servicios que propuso en el primer intento — es un acoplamiento innecesario
- Un `APP_INITIALIZER` que propuso para cargar configuración — sobreingeniería para este caso
- La clase `ApiInterceptor implements HttpInterceptor` — ya no es el patrón moderno en Angular 17+

## Qué modifiqué

- El `LoggerService` original no inyectaba `ENVIRONMENT`, usaba `isDevMode()`. Lo cambié para que dependa del token, más testeable
- El `apiInterceptor` no manejaba el caso donde la URL ya sea absoluta (empieza con `http`). Lo añadí: `if (!req.url.startsWith('http'))`
