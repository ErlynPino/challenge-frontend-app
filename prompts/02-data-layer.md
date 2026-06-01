# Prompt 02 — Data Layer: Model, Service & Signals Store

## Context
DummyJSON API selected as backend. Need typed interfaces, a mapper, HTTP service and a reactive Signals store with optimistic updates.

## Prompt

```
Create the complete data layer for a User Management feature consuming DummyJSON (/users endpoints).

1. TypeScript interfaces:
   - User { id, first_name, last_name, username, email, role: UserRole, active, created_at }
   - CreateUserDto, UpdateUserDto (Partial of User fields)
   - DummyJsonUser (raw API shape with firstName/lastName)
   - UserListParams { page, pageSize, search?, roleFilter?, activeFilter? }
   - UserListResponse { users: User[], total: number }

2. mapDummyJsonUser(raw: DummyJsonUser): User
   - firstName -> first_name, lastName -> last_name
   - Normalize role to 'admin'|'user'|'guest', fallback 'user'
   - Derive created_at from id (simulate a date)
   - active defaults to true

3. UserService (injectable):
   - getUsers(params): hits /users or /users/search?q= depending on search param
   - getUserById(id), createUser(dto) -> POST /users/add, updateUser(id,dto) -> PUT, deleteUser(id) -> DELETE
   - All return typed Observables

4. UserStore (service-based Signals store):
   - Private WritableSignal for each piece of state, public .asReadonly() exposed
   - computed() signals: users() (client-side filtered by roleFilter/activeFilter), totalPages(), isEmpty()
   - Actions: loadUsers(), loadUserById() (cache-first), createUser(), updateUser(), deleteUser()
   - deleteUser and updateUser must be optimistic: mutate state immediately, rollback on error
   - All mutating actions return Observable<void> and manage isLoading/error with finalize()

Constraints: no NgRx, no zone.js, inject() only, no constructor injection.
```

## Key Decisions Made
- Signals store as a service avoids NgRx boilerplate while keeping reactive state
- Optimistic updates give instant feedback; snapshot captured before mutation enables rollback
- `finalize()` in RxJS pipe guarantees `isLoading = false` even on error, no duplicate cleanup code
- Cache-first `loadUserById` avoids redundant HTTP calls when navigating list → detail
