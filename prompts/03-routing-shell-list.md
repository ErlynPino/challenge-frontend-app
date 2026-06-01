# Prompt 03 — Routing, App Shell & User List

## Context
Need lazy-loaded routing tree, a persistent layout shell and the main user list page.

## Prompt

`````nCreate the routing architecture and main list page for the User Management SPA.

1. app.routes.ts: Shell as layout root (loadComponent lazy), users feature with loadChildren pointing to users.routes.ts. Wildcard redirects to /users.
2. users.routes.ts: '' -> UserList, 'new' -> UserForm, ':id' -> UserDetail, ':id/edit' -> UserForm. All lazy via loadComponent.
3. ShellComponent: header with app name + nav link to /users. Embeds <router-outlet>. Also renders <p-toast> and <p-confirmDialog> globally. Add a skip-link (.skip-link) that shows on focus for keyboard users.
4. UserListComponent:
   - p-table with [lazy]=true, (onLazyLoad), server-side pagination
   - Debounced search input (Subject + debounceTime 400ms + distinctUntilChanged + takeUntilDestroyed)
   - p-select dropdowns for role ('admin','user','guest') and active (true/false) filters
   - Columns: ID, Name, Email, Role (p-tag severity), Active (p-tag), Created, Actions (Edit / Delete)
   - Delete triggers ConfirmationService.confirm() then calls store.deleteUser()
   - Responsive: hide Email on mobile, hide Created on tablet

Constraints: Angular 21 control flow (@if/@for), input.required<string>() for route params, withComponentInputBinding() already configured.
`````n
## Key Decisions Made
- Shell as layout parent keeps Toast + ConfirmDialog always mounted regardless of active child route
- DestroyRef + takeUntilDestroyed() for safe Observable cleanup without implementing OnDestroy
- (onLazyLoad) drives pagination from p-table's own internal state — single source of truth for page/rows
