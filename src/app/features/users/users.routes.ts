import { Routes } from '@angular/router';
import { numericIdGuard } from '../../core/guards/numeric-id.guard';
import { pendingChangesGuard } from '../../core/guards/pending-changes.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'new',
    canDeactivate: [pendingChangesGuard],
    loadComponent: () =>
      import('./pages/user-form/user-form.component').then((m) => m.UserFormComponent),
  },
  {
    path: ':id',
    canActivate: [numericIdGuard],
    loadComponent: () =>
      import('./pages/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
  },
  {
    path: ':id/edit',
    canActivate: [numericIdGuard],
    canDeactivate: [pendingChangesGuard],
    loadComponent: () =>
      import('./pages/user-form/user-form.component').then((m) => m.UserFormComponent),
  },
];
