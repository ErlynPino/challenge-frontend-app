# Prompt 04 — UserDetail, UserForm y CRUD completo

## Objetivo de la sesión

Implementar la vista de detalle (solo lectura) y el formulario compartido para crear/editar usuarios con validaciones custom y feedback al usuario.

---

## Prompt inicial — UserDetail

```
Necesito UserDetailComponent en /users/:id.
El :id llega como input() string gracias a withComponentInputBinding.

Requerimientos:
- Llamar store.loadUserById(+id()) al inicializar
- Mostrar skeleton mientras carga (no spinner)
- Mostrar mensaje de error si falla
- Card con: avatar con iniciales del nombre, y todos los campos en un <dl>
- Botones: Editar (navega a /:id/edit) y Eliminar (confirm dialog + toast + vuelve a /users)

¿Cómo manejo la inicialización cuando id() es un signal input?
¿Debo usar effect() o ngOnInit?
```

---

## Prompt de seguimiento — UserForm

```
Ahora UserFormComponent, compartido para /users/new y /users/:id/edit.
El id llega como input() opcional — si existe es modo edición.

Formulario reactivo con:
- username: required, minLength(3), sin espacios (custom validator)
- email: required, email
- first_name, last_name: required
- role: required, debe ser uno de ['admin','user','guest'] (custom validator)
- active: boolean con p-toggleswitch

En modo edición: cargar el usuario y parchear el formulario.
Al hacer submit: store.createUser() o store.updateUser() según el modo.
Mostrar toast de éxito/error y navegar a /users si funciona.

Todos los inputs deben tener aria-required, aria-invalid, aria-describedby.
Los mensajes de error deben tener role=alert.
```

---

## Prompt de ajuste — bug en el patch del formulario

```
El formulario en modo edición no se llena. El problema es que store.loadUserById()
es async y el formulario ya está inicializado cuando llegan los datos.
La IA proponía usar ngDoCheck para detectar cuando selectedUser() ya tiene valor
y parchear el form si está pristine. ¿Es la mejor opción o hay algo más limpio?
```

_La IA reconoció que `effect()` sería más idiomático con Signals, pero en ese momento el proyecto ya usaba `ngDoCheck` y funcionaba. Acepté el trade-off y lo documenté como deuda técnica._

---

## Prompt de ajuste — bug con el guard de cambios pendientes

```
Agregué un pendingChangesGuard que bloquea navegación si el form tiene dirty=true.
El problema: después de hacer submit exitoso, el router.navigate() también dispara el guard
y aparece el confirm() aunque el usuario guardó correctamente.
¿Cómo evito eso sin eliminar el guard?
```

_La IA sugirió `this.form.markAsPristine()` antes del `navigate()`. Simple y correcto. Lo apliqué directamente._

---

## Qué acepté

- Los custom validators como funciones puras fuera de la clase — más testeable que como métodos del componente
- `firstValueFrom()` para convertir el Observable del store a Promise dentro del `async onSubmit()` — no lo había usado antes en este contexto
- El avatar con iniciales calculado en el template: `user.first_name[0] + user.last_name[0]`

## Qué descarté

- Un `FormArray` para roles múltiples que la IA propuso — el schema solo admite un rol, eso era sobreingenieria
- Un `ReplaySubject` para esperar los datos del usuario antes de inicializar el form — complicó más de lo que resolvía
- El uso de `[(ngModel)]` en el toggleswitch que apareció en una respuesta — el form es completamente reactivo, no mezclo

## Qué modifiqué

- Los mensajes de error del `fieldError()` estaban hardcodeados en inglés. Los cambié a español y después al agregar i18n los uniformé con el `TranslatePipe`
- La condición del `ngDoCheck` la refiné: la IA usaba `!this.form.get('email')?.value` como flag, yo agregué `this.form.pristine` para no parchear si el usuario ya editó algo
