# Prompt 04 — UserDetail, UserForm & CRUD Actions

## Context
Need a read-only detail page and a shared create/edit reactive form.

## Prompt

`````nImplement UserDetail and UserForm for the User Management SPA.

UserDetailComponent (/users/:id):
- input.required<string>() bound to route :id via withComponentInputBinding
- Loads user via store.loadUserById(+id()) on effect (use computed or manual call)
- Shows loading skeleton, error message or user card depending on store signals
- User card: avatar with initials, dl grid with all fields
- Actions: Delete (confirm dialog + toast + navigate /users) and Edit (navigate /:id/edit)

UserFormComponent (/users/new and /users/:id/edit):
- input<string>() optional id — presence determines create vs edit mode
- ReactiveForm: first_name, last_name, username, email (required, email validator), role (p-select), active (p-toggleswitch)
- Custom validators: noWhitespaceValidator (trims and checks not empty), roleValidator(allowedRoles[])
- ngDoCheck patches form values once selectedUser signal resolves (avoids ExpressionChanged errors)
- onSubmit uses firstValueFrom(store.createUser/updateUser()) + toast success/error
- All inputs have aria-required, aria-invalid, aria-describedby. Errors have role=alert

Constraints: no template-driven forms, no NgModules, PrimeNG components only for UI inputs.
`````n
## Key Decisions Made
- Shared component for create + edit reduces duplication; route param presence is the discriminator
- 
gDoCheck for patching avoids timing issues with signal-based async data vs form initialization
- irstValueFrom() converts Observable store actions to Promise for async/await in submit handler
