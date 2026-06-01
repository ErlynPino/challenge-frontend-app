import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';

import { CreateUserDto, UpdateUserDto, User, UserRole } from '../models/user.model';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly userService = inject(UserService);

  // ── Private state ──────────────────────────────────────────────────────────
  private readonly _users = signal<User[]>([]);
  private readonly _selectedUser = signal<User | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _total = signal(0);
  private readonly _page = signal(1);
  private readonly _pageSize = signal(10);
  private readonly _search = signal('');
  private readonly _roleFilter = signal<UserRole | null>(null);
  private readonly _activeFilter = signal<boolean | null>(null);

  // ── Public readonly signals ────────────────────────────────────────────────
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly search = this._search.asReadonly();
  readonly roleFilter = this._roleFilter.asReadonly();
  readonly activeFilter = this._activeFilter.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();

  // ── Derived state ──────────────────────────────────────────────────────────
  readonly users = computed(() => {
    let list = this._users();
    const role = this._roleFilter();
    const active = this._activeFilter();
    if (role !== null) list = list.filter(u => u.role === role);
    if (active !== null) list = list.filter(u => u.active === active);
    return list;
  });

  readonly totalPages = computed(() => Math.ceil(this._total() / this._pageSize()));
  readonly isEmpty = computed(() => !this._isLoading() && this.users().length === 0);

  // ── Actions ────────────────────────────────────────────────────────────────

  loadUsers(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.userService
      .getUsers({ page: this._page(), pageSize: this._pageSize(), search: this._search() || undefined })
      .subscribe({
        next: ({ users, total }) => {
          this._users.set(users);
          this._total.set(total);
          this._isLoading.set(false);
        },
        error: () => {
          this._error.set('No se pudieron cargar los usuarios.');
          this._isLoading.set(false);
        },
      });
  }

  loadUserById(id: number): void {
    const cached = this._users().find(u => u.id === id);
    if (cached) {
      this._selectedUser.set(cached);
      return;
    }

    this._isLoading.set(true);
    this._error.set(null);

    this.userService.getUserById(id).subscribe({
      next: user => {
        this._selectedUser.set(user);
        this._isLoading.set(false);
      },
      error: () => {
        this._error.set('No se encontró el usuario.');
        this._isLoading.set(false);
      },
    });
  }

  createUser(dto: CreateUserDto): Observable<void> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.userService.createUser(dto).pipe(
      tap(newUser => {
        const withLocalId: User = { ...newUser, id: Date.now(), created_at: new Date().toISOString() };
        this._users.update(users => [withLocalId, ...users]);
        this._total.update(t => t + 1);
      }),
      map(() => undefined),
      catchError(err => {
        this._error.set('No se pudo crear el usuario.');
        return throwError(() => err);
      }),
      finalize(() => this._isLoading.set(false)),
    );
  }

  updateUser(id: number, dto: UpdateUserDto): Observable<void> {
    const snapshot = this._users();
    this._isLoading.set(true);
    this._error.set(null);

    this._users.update(users =>
      users.map(u => (u.id === id ? { ...u, ...dto, updated_at: new Date().toISOString() } : u)),
    );

    return this.userService.updateUser(id, dto).pipe(
      map(() => undefined),
      catchError(err => {
        this._users.set(snapshot);
        this._error.set('No se pudo actualizar el usuario.');
        return throwError(() => err);
      }),
      finalize(() => this._isLoading.set(false)),
    );
  }

  deleteUser(id: number): Observable<void> {
    const snapshot = this._users();

    this._users.update(users => users.filter(u => u.id !== id));
    this._total.update(t => t - 1);

    return this.userService.deleteUser(id).pipe(
      map(() => undefined),
      catchError(err => {
        this._users.set(snapshot);
        this._total.update(t => t + 1);
        return throwError(() => err);
      }),
    );
  }

  setPage(page: number): void {
    this._page.set(page);
    this.loadUsers();
  }

  setSearch(query: string): void {
    this._search.set(query);
    this._page.set(1);
    this.loadUsers();
  }

  setRoleFilter(role: UserRole | null): void {
    this._roleFilter.set(role);
  }

  setActiveFilter(active: boolean | null): void {
    this._activeFilter.set(active);
  }

  clearSelectedUser(): void {
    this._selectedUser.set(null);
  }
}
