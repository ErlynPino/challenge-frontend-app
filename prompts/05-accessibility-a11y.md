# Prompt 05 — Accesibilidad WCAG 2.1 AA, modo oscuro, i18n y bonus

## Objetivo de la sesión

Cumplir los requerimientos de accesibilidad del challenge y sumar los bonus más valorados: dark mode, i18n, skeleton loaders y guards de ruta.

---

## Prompt inicial — Accesibilidad

```
Necesito auditar la app para WCAG 2.1 AA. ¿Qué me estaría faltando con lo que ya tengo?
Tengo: labels en inputs, focus-visible en CSS, aria-invalid en el formulario.
¿Qué más debo agregar?
```

_Intencionalmente no le di el código, quería ver qué gaps comunes identifica._

La IA listó: `aria-busy` en la tabla durante carga, `aria-live` en regiones de estado, `role=alert` en errores, skip-link, `aria-label` en botones icon-only. Todo correcto.

---

## Prompt de seguimiento — Dark mode

```
Quiero agregar dark mode con toggle en el header, persistido en localStorage.
Debo usar la clase .app-dark en el html element (configurado en PrimeNG darkModeSelector).

Necesito:
- ThemeService con signal<boolean> que lea localStorage al inicio
  y también detecte prefers-color-scheme si no hay preferencia guardada
- effect() que aplique/quite la clase .app-dark y guarde en localStorage
- Botón en el header con icono sol/luna
- Variables CSS en :root para todos los colores, overrideadas en .app-dark
```

---

## Prompt de seguimiento — i18n

```
Quiero i18n mínimo EN/ES sin usar @angular/localize (no necesito SSR ni builds separados).
Plan: un objeto de traducciones, un servicio con signal<'es'|'en'> y un Pipe pure:false.

¿Está bien ese approach o ves algún problema?
```

_Le pedí opinión antes de que generara código. Confirmó que es válido para este escenario. Luego pedí el código._

---

## Prompt de seguimiento — Route Guards

```
El challenge pide route guards. Quiero dos:
1. numericIdGuard: canActivate en /:id y /:id/edit — valida que el param sea entero positivo,
   si no redirige a /users
2. pendingChangesGuard: canDeactivate en el formulario — bloquea navegación si hay cambios sin guardar

Usa funciones (CanActivateFn / CanDeactivateFn), no clases.
El componente debe implementar una interfaz CanComponentDeactivate con método canDeactivate(): boolean.
```

---

## Qué acepté

- El sistema de CSS custom properties en `:root` con override en `.app-dark` — limpio y no requiere JavaScript
- El `TranslatePipe` con `pure: false` para que Angular lo reevalue cuando cambia el signal del idioma
- El `effect()` en `ThemeService` para el side effect de DOM — patrón correcto con Signals
- Los guards como funciones funcionales — conciso y no requiere clase ni `providedIn`

## Qué descarté

- `@angular/localize` que la IA sugirió inicialmente para i18n — requiere configuración de build y no aporta para este escenario
- Un `MutationObserver` que propuso para detectar cambios de clase en el DOM — innecesario, el `effect()` ya maneja eso
- `APP_INITIALIZER` para cargar el tema antes del render — el `effect()` en el constructor del service es suficiente y más simple

## Qué modifiqué

- El icono del botón de tema: la IA usó `[class.pi-sun]` + `[class.pi-moon]` en bindings separados. Eso rompe con PrimeIcons porque la clase base `pi` también se pierde. Lo corregí con un binding único: `[class]="isDark() ? 'pi pi-sun' : 'pi pi-moon'"`
- Los colores hardcodeados en `user-detail.component.scss` (`#fff`, `#f9fafb`, etc.) — la IA los dejó como estaban. Los reemplacé manualmente con `var(--color-surface)`, `var(--color-bg)`, etc. para que el dark mode funcionara correctamente
