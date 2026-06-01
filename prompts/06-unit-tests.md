# Prompt 06 — Unit Tests (Vitest + Angular Testing Library)

## Context
Vitest replaces Karma. No zone.js available — fakeAsync/tick are not usable. Need meaningful tests with HttpTestingController.

## Prompt

`````nWrite unit tests for the Angular 21 User Management SPA using Vitest.

Important constraints:
- NO fakeAsync, NO tick — the @angular/build:unit-test Vitest runner has no zone.js
- Use HttpTestingController.flush() which delivers HTTP responses synchronously
- Signals update synchronously after flush — no detectChanges() needed for signal reads

Test suites needed:

1. LoggerService: log/warn/error in dev mode; only error in prod; all silent except error
2. UserService: getUsers() hits correct URL with params; search uses /users/search; getUserById, createUser, updateUser, deleteUser verify request bodies and mapping
3. UserStore:
   - Initial state: empty users, isLoading false, error null
   - loadUsers() success: signals populated after flush
   - loadUsers() error: error signal set, users remain empty
   - setRoleFilter() filters via computed signal
   - deleteUser() optimistic: user removed before flush; rolls back after 500 error
   - loadUserById() cache-first: no HTTP call if user already in list

4. Form validators: noWhitespaceValidator rejects blank/whitespace, accepts valid strings; roleValidator rejects unknown roles
5. mapDummyJsonUser: maps firstName/lastName, normalizes unknown role to user, derives created_at
6. Component smoke tests (create only): ShellComponent, UserListComponent, UserDetailComponent with required providers

Pattern for store tests:
store.loadUsers(); // triggers HTTP
expect(store.isLoading()).toBe(true);
http.expectOne(r => r.url === '/users').flush({ users: [...], total: 2, skip: 0, limit: 10 });
expect(store.isLoading()).toBe(false); // synchronous after flush
expect(store.users().length).toBe(2);
`````n
## Key Decisions Made
- Synchronous flush pattern is the idiomatic Vitest solution without zone.js
- Smoke tests for components verify DI tree is correct without testing implementation details
- fterEach(() => http.verify()) catches unexpected HTTP calls as test failures
