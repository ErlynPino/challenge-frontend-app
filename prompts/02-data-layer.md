# Prompt 02 — Data Layer: Modelo, Servicio y Signals Store

## Objetivo de la sesión

Definir los tipos TypeScript, el mapper de DummyJSON, el servicio HTTP y el store reactivo. Quería tener claro el contrato de datos antes de tocar ningún componente.

---

## Prompt inicial

```
Voy a consumir DummyJSON (/users). El problema es que su schema usa firstName/lastName
y el challenge pide first_name/last_name. También le faltan created_at y active.

Necesito:
1. Interfaces TypeScript: User (schema del challenge), DummyJsonUser (raw API), DTOs para create/update
2. Una función mapDummyJsonUser() que normalice el schema
3. UserService con HttpClient para todos los endpoints CRUD

Por ahora solo eso, el store lo hago en el siguiente paso.
```

---

## Prompt de seguimiento — Store

```
Ahora el store. Quiero service-based con Angular Signals, no NgRx.
Tengo clara la estructura: WritableSignal privados, asReadonly() público.

Necesito:
- Estado: users, selectedUser, isLoading, error, page, pageSize, search, roleFilter, activeFilter
- computed(): users filtrado, totalPages, isEmpty
- Acciones: loadUsers, loadUserById (cache-first si el user ya está en el array),
  createUser, updateUser, deleteUser
- updateUser y deleteUser con optimistic update + rollback en error
- Las acciones mutantes deben devolver Observable<void> para poder hacer firstValueFrom() en el componente

¿Cómo manejarías el isLoading con finalize() para garantizar que siempre se resetea?
```

_Le pregunté explícitamente sobre finalize() porque quería confirmar que sabía que el error no aborta finalize — es un detalle que muchos juniors no conocen._

---

## Prompt de ajuste

```
El mapper que generaste usa new Date(2024, raw.id % 12, raw.id % 28) para created_at.
Eso da fechas inválidas cuando id % 28 === 0 (día 0 no existe).
Cambiá la lógica para que sea más robusta.
```

---

## Qué acepté

- El patrón de `asReadonly()` en los signals públicos — no lo había aplicado antes de forma sistemática
- El uso de `finalize()` al final del pipe en lugar de `catchError` + `tap` duplicado
- La separación entre `CreateUserDto` y `UpdateUserDto` como `Partial<CreateUserDto>` — simple y correcto
- Cache-first en `loadUserById`: si el user ya está en `_users`, no hace request HTTP

## Qué descartué

- La IA propuso NgRx Signals como alternativa — lo rechacé, el dominio es simple y no justifica la dependencia
- Propuso `activeFilter` como parte de la query HTTP — DummyJSON no tiene ese endpoint, lo mantuve client-side
- Un `BehaviorSubject` wrapper que propuso como alternativa al Signal store — ya domino Signals y es más moderno

## Qué modifiqué

- La función mapper: el fallback de `role` a `'user'` cuando DummyJSON devuelve algo inesperado, lo añadí yo — la IA no lo incluyó
- El `createUser` en el store: la IA guardaba el resultado directo del API en `_users`. El problema es que DummyJSON no persiste el POST, entonces al recargar desaparece. Cambié la lógica para guardar en `_localUsers` separado que `loadUsers()` no toca
