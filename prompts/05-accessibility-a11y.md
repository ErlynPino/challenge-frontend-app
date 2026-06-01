# Prompt 05 — Accessibility (WCAG 2.1 AA) & Responsive Table Design

## Context
App functional but missing accessibility attributes and polished table styles.

## Prompt

`````nAudit and improve the User Management SPA for WCAG 2.1 AA compliance and table UX.

Accessibility requirements:
- Skip navigation link (.skip-link) visible on :focus, hidden otherwise
- All interactive elements reachable by keyboard (tabindex, keydown.space for table rows)
- aria-busy on table during loading, aria-live=polite on status regions
- aria-label on icon-only buttons, aria-invalid + aria-describedby on form inputs
- role=alert on validation error messages, role=row on tr elements
- focus-visible outline using CSS custom property --color-primary
- .sr-only utility class for screen-reader-only labels

Table design:
- Custom CSS in styles.scss (no inline styles) targeting .p-datatable
- Thead: light grey background, uppercase muted labels, compact padding
- Rows: hover with primary-light color, compact padding
- Responsive: .col-hide-mobile hidden at 640px, .col-hide-tablet hidden at 768px
- Border + border-radius on the table container

CSS custom properties system:
Define --color-primary, --color-primary-dark, --color-primary-light, --color-surface, --color-bg, --color-border, --color-text, --color-text-muted, --color-success, --color-danger on :root
`````n
## Key Decisions Made
- CSS custom properties on :root allow consistent theming without Tailwind config file
- :focus-visible (not :focus) avoids visible ring on mouse click while keeping keyboard nav
- Responsive column classes in global CSS so any future table inherits responsive behaviour automatically
