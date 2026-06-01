import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';

import { CreateUserDto, UpdateUserDto, User, UserRole } from '../models/user.model';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly userService = inject(UserService);

  // ── Private state ──────────────────────────────────────────────────────────
  private readonly _users = signal<User[]>([]);
  /** Users created in this session — not persisted on DummyJSON, never overwritten by loadUsers(). */
  private readonly _localUsers = signal<User[]>([]);
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
    const role = this._roleFilter();
    const active = this._activeFilter();
    const search = this._search();

    // Local (session) users: always filter client-side.
    let localList = this._localUsers();
    if (role !== null) localList = localList.filter((u) => u.role === role);
    if (active !== null) localList = localList.filter((u) => u.active === active);

    // Server users: role is filtered server-side unless search is active
    // (DummyJSON can't combine /filter + /search).
    let serverList = this._users();
    if (role !== null && search) serverList = serverList.filter((u) => u.role === role);
    if (active !== null) serverList = serverList.filter((u) => u.active === active);

    return [...localList, ...serverList];
  });

  readonly totalPages = computed(() =>
    Math.ceil((this._total() + this._localUsers().length) / this._pageSize()),
  );
  readonly isEmpty = computed(() => !this._isLoading() && this.users().length === 0);

  // ── Actions ────────────────────────────────────────────────────────────────

  loadUsers(): void {
    this._isLoading.set(true);
    this._error.set(null);

    // Pass role to server only when not searching (DummyJSON limitation: /users/filter
    // and /users/search cannot be combined in a single request).
    const search = this._search() || undefined;
    this.userService
      .getUsers({
        page: this._page(),
        pageSize: this._pageSize(),
        search,
        role: !search ? (this._roleFilter() ?? undefined) : undefined,
      })
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
    const cached = this._users().find((u) => u.id === id);
    if (cached) {
      this._selectedUser.set(cached);
      return;
    }

    this._isLoading.set(true);
    this._error.set(null);

    this.userService.getUserById(id).subscribe({
      next: (user) => {
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
      tap((newUser) => {
        const withLocalId: User = {
          ...newUser,
          id: Date.now(),
          created_at: new Date().toISOString(),
        };
        // Store in _localUsers so loadUsers() (triggered on navigate back) doesn't erase it.
        this._localUsers.update((local) => [withLocalId, ...local]);
      }),
      map(() => undefined),
      catchError((err) => {
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

    this._users.update((users) =>
      users.map((u) => (u.id === id ? { ...u, ...dto, updated_at: new Date().toISOString() } : u)),
    );

    return this.userService.updateUser(id, dto).pipe(
      map(() => undefined),
      catchError((err) => {
        this._users.set(snapshot);
        this._error.set('No se pudo actualizar el usuario.');
        return throwError(() => err);
      }),
      finalize(() => this._isLoading.set(false)),
    );
  }

  deleteUser(id: number): Observable<void> {
    const snapshotServer = this._users();
    const snapshotLocal = this._localUsers();
    this._isLoading.set(true);
    this._error.set(null);

    // Remove from whichever list contains this id.
    const isLocal = this._localUsers().some((u) => u.id === id);
    if (isLocal) {
      this._localUsers.update((local) => local.filter((u) => u.id !== id));
    } else {
      this._users.update((users) => users.filter((u) => u.id !== id));
      this._total.update((t) => t - 1);
    }

    return this.userService.deleteUser(id).pipe(
      map(() => undefined),
      catchError((err) => {
        this._users.set(snapshotServer);
        this._localUsers.set(snapshotLocal);
        if (!isLocal) this._total.update((t) => t + 1);
        this._error.set('No se pudo eliminar el usuario.');
        return throwError(() => err);
      }),
      finalize(() => this._isLoading.set(false)),
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
    this._page.set(1);
    this.loadUsers();
  }

  setActiveFilter(active: boolean | null): void {
    this._activeFilter.set(active);
  }

  clearSelectedUser(): void {
    this._selectedUser.set(null);
  }
}
