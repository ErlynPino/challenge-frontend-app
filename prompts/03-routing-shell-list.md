# Prompt 03 — Routing, App Shell y User List

## Objetivo de la sesión

Armar el routing lazy-loaded, el shell de layout y la pantalla de lista de usuarios con paginación server-side, búsqueda debounced y filtros.

---

## Prompt inicial

```
Necesito el routing de la SPA. Tengo un ShellComponent como layout padre
con <router-outlet> y quiero que los features sean lazy-loaded.

Estructura:
- / → redirige a /users
- /users → UserList (lazy)
- /users/new → UserForm (lazy)
- /users/:id → UserDetail (lazy)
- /users/:id/edit → UserForm (lazy)
- ** → redirige a /users

¿Cómo estructuro el archivo de rutas para que el Shell sea el layout raíz
y las rutas hijas sean children sin duplicar el componente?
```

---

## Prompt de seguimiento — UserList

```
Ahora el componente UserListComponent.
Requirements:
- Usa p-table de PrimeNG con [lazy]=true para paginación server-side
- El evento (onLazyLoad) debe calcular la página y llamar store.setPage()
- Búsqueda debounced: Subject<string> + debounceTime(400) + distinctUntilChanged + takeUntilDestroyed(destroyRef)
- Dos dropdowns p-select: filtro por role (admin/user/guest/null) y por active (true/false/null)
- Columnas: username, email, nombre completo, role (p-tag), active (p-tag), created_at, acciones
- Acciones: editar (navega /:id/edit) y eliminar (confirm dialog antes de llamar store.deleteUser)
- Responsive: ocultar email en mobile (<640px), ocultar created en tablet (<768px)

No uses *ngIf ni *ngFor, solo la sintaxis @if/@for de Angular 17+.
```

---

## Prompt de ajuste — problema con el Subject del search

```
El código generado declara searchInput$ como Subject pero lo inicializa en ngOnInit.
Preferí declararlo directamente en la clase: private readonly searchInput$ = new Subject<string>();
Para que sea readonly y no dependa del ciclo de vida.
¿Hay algún problema con eso?
```

_La IA confirmó que es válido y más limpio. Actualicé el código manualmente._

---

## Qué acepté

- El patrón de Shell como layout padre con `children` en las rutas — no había pensado en montarlo así para mantener el Toast y ConfirmDialog siempre activos
- `takeUntilDestroyed(destroyRef)` inyectando `DestroyRef` — más limpio que implementar `OnDestroy`
- `withComponentInputBinding()` en `app.config.ts` para bindear el param `:id` directo a un `input()` del componente

## Qué descartué

- El `canActivate: [AuthGuard]` que generó automáticamente — esta app no tiene auth, lo eliminé
- Un `trackBy` genérico `trackByIndex` que propuso — preferí `trackBy: user.id` para que el diff del DOM sea correcto
- El uso de `BehaviorSubject` para el search que sugirió en el primer intento — `Subject` es suficiente, no necesito el valor inicial

## Qué modifiqué

- El `onLazyLoad` generado hacía `store.setPage(event.first / event.rows + 1)` sin null checks — agregué `event.first ?? 0` y `event.rows ?? store.pageSize()`
- El delete en la lista usaba `window.confirm()` — lo cambié a `ConfirmationService.confirm()` de PrimeNG para ser consistente con el diseño
