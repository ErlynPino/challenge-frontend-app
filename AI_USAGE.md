# AI Usage Documentation

This document describes how GitHub Copilot (Claude Sonnet) was used throughout the development of this challenge.

---

## Role of AI in This Project

The AI assistant acted as a **tech lead pair programmer**, driving architecture decisions and implementation phase by phase. Every code block was reviewed before committing. The developer maintained control over acceptance, rejection, and direction of each phase.

---

## Workflow

Each phase followed this cycle:

1. Developer describes the goal in natural language
2. AI proposes approach + implementation
3. Developer reviews generated code in VS Code
4. Developer accepts or requests changes
5. Commit only after explicit approval

---

## Phases and AI Contribution

### Phase 1 — Project Setup
- Configured `angular.json` builder to use Vitest (`@angular/build:unit-test`)
- Added `tsconfig.spec.json` with `"types": ["vitest/globals"]`
- Wired `@tailwindcss/vite` plugin
- Created `ENVIRONMENT` InjectionToken to decouple environment from filesystem imports
- Generated `LoggerService` (prod-silent) and `apiInterceptor` (functional)

### Phase 2 — Data Layer
- Designed `User`, `CreateUserDto`, `UpdateUserDto`, `DummyJsonUser` TypeScript interfaces
- Wrote `mapDummyJsonUser()` normalising DummyJSON field names (`firstName → first_name`, etc.)
- Built `UserService` with typed HTTP methods for all CRUD operations
- Created service-based **Signals Store** (`UserStore`) with:
  - Private `WritableSignal` fields, public `.asReadonly()` exposed API
  - `computed()` signals for filtered list, `totalPages`, `isEmpty`
  - Optimistic update + snapshot rollback pattern for delete/update

### Phase 3 — Routing + App Shell
- Designed lazy-loaded route tree: Shell layout → feature children
- Implemented `ShellComponent` with header, skip-link, `<p-toast>`, `<p-confirmDialog>`
- Added `withComponentInputBinding()` for route param → signal input binding

### Phase 4 — User List
- PrimeNG `p-table` with `[lazy]` + `(onLazyLoad)` for server-side pagination
- Debounced search via `Subject + debounceTime(400) + distinctUntilChanged()`
- `p-select` dropdowns for role and active status filters
- Responsive column classes (`col-hide-mobile`, `col-hide-tablet`)

### Phase 5 — User Detail
- Read-only card layout with `<dl>` for structured data
- Avatar with initials derived from name
- Delete action with confirm dialog + toast + navigate back

### Phase 6 — User Form
- Reactive form (`FormBuilder`) shared between create and edit routes
- Custom validators: `noWhitespaceValidator`, `roleValidator`
- `ngDoCheck()` strategy to patch form values once `selectedUser` signal resolves
- `firstValueFrom()` to await store Observable actions inside async submit handler

### Phase 7 — Toast + Confirm Dialog
- All destructive actions guarded with `ConfirmationService.confirm()`
- Success/error outcomes reported via `MessageService` toasts
- Confirm dialog wired globally in `ShellComponent`

### Phase 8 — WCAG 2.1 AA
- Added `aria-busy`, `aria-live`, `aria-label`, `aria-invalid`, `aria-describedby`, `role="alert"`
- Skip navigation link (`.skip-link`) visible only on focus
- `focus-visible` outline via CSS custom property
- `.sr-only` utility class for screen-reader-only text

### Phase 9 — Unit Tests
- 30 tests across 8 suites using `HttpTestingController` (synchronous flush)
- Key insight: Vitest + `@angular/build:unit-test` has **no zone.js** — `fakeAsync`/`tick` do not work; synchronous subscribe pattern used instead
- UserStore tested for: initial state, load success/error, role filter computed signal, optimistic rollback, cache-first `loadUserById`

---

## AI Limitations Encountered

| Issue | Resolution |
|---|---|
| `fakeAsync` crashes in Vitest (no zone.js) | Rewrote all store tests using synchronous `HttpTestingController.flush()` |
| `acceptSeverity` not in PrimeNG 21 Confirmation API | Removed — no equivalent exists |
| Duplicate providers after `replace_string_in_file` corruption | Rewrote file via `Set-Content` PowerShell |
| `NG0201` errors in component specs | Added missing `MessageService` + `ConfirmationService` providers |

---

## Prompts

The detailed prompt sequence is documented in the [`/prompts`](./prompts/) folder.

---

## Time Breakdown (approximate)

| Activity | Time |
|---|---|
| AI-assisted implementation (phases 1-9) | ~4 hours |
| Code review + corrections between phases | ~1 hour |
| Debugging test failures + provider issues | ~45 min |
| Documentation (this file + README) | ~20 min |
