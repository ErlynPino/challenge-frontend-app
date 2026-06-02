# Prompt 06 — Unit Tests con Vitest

## Objetivo de la sesión

Escribir tests significativos para los archivos más críticos. El challenge pide mínimo 3, yo quise ir más allá para cubrir los flujos de error y los casos edge.

---

## Prompt inicial

```
Necesito tests con Vitest para esta app Angular 21.
Hay un constraint importante: el builder @angular/build:unit-test no tiene zone.js,
asique fakeAsync y tick no funcionan.

¿Cómo testeo código async con HttpClient sin fakeAsync?
```

_Primero pregunté el patrón, no el código. Quería entender el approach antes de pedirle que generara tests._

La IA explicó `HttpTestingController.flush()` que entrega la respuesta sincróna. Los signals se actualizan sincrono también. Ese patrón lo entendí y luego lo usé como base.

---

## Prompt de seguimiento — Tests del Store

```
Escribí los tests de UserStore con este patrón:

store.loadUsers();
http.expectOne(r => r.url === '/users').flush({ users: [...], total: 2 });
expect(store.users().length).toBe(2);

Necesito cubrir:
- Estado inicial
- loadUsers() éxito y error
- setRoleFilter() — ahora va al server en /users/filter
- deleteUser() optimistic + rollback en error 500
- loadUserById() desde cache (no debe hacer HTTP si el user ya está en el array)

El estado actual del store tiene _localUsers separado de _users.
Asegúrate de que el test de deleteUser haga flush del /users/1 con el matcher r.url.
```

---

## Prompt de seguimiento — Tests de servicio y validators

```
También necesito:
- LoggerService: que log/warn no llamen console en producción, error siempre sí
- UserService: verificar que getUsers() usa /users/filter cuando viene role param,
  y /users/search cuando viene search
- Custom validators: noWhitespaceValidator y roleValidator con casos válidos e inválidos
- mapDummyJsonUser: que mapee firstName->first_name y que normalice rol desconocido a 'user'
- Smoke tests de ShellComponent, UserListComponent, UserDetailComponent (solo que monten sin error)
```

---

## Qué acepté

- El patrón `http.expectOne(r => r.url === '/users')` con matcher de función en lugar de string — más robusto cuando hay query params
- `afterEach(() => http.verify())` para detectar requests no esperados como fallo de test
- Los providers mínimos en los smoke tests: `MessageService`, `ConfirmationService`, `ENVIRONMENT` — la IA los listó todos y funcionó al primer intento

## Qué descarté

- Tests con `spectator` que propuso — no quería agregar otra dependencia de testing
- `TestScheduler` de RxJS para los tests de debounce — el patrón HttpTestingController es suficiente para lo que necesito
- Tests de componente que verificaban el DOM con `DebugElement` — prefiero smoke tests livianos; los tests del store cubren la lógica real

## Qué modifiqué

- El test de `setRoleFilter()` que la IA escribió asumía filtrado client-side (`expect(store.users().length).toBe(1)` sin hacer flush). Cuando moqueé el filtro al servidor, el test rompió. Lo reescribí para hacer `http.expectOne(r => r.url === '/users/filter')` y verificar los query params
- Los tests del store empezaban fallando con `Cannot configure the test module when already instantiated` porque usaba `inject()` fuera del contexto de TestBed. Lo corregí moviendo los `inject()` dentro del `beforeEach()`
