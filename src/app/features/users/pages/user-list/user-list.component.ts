import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

import { UserStore } from '../../store/user.store';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  imports: [
    DatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    IconField,
    InputIcon,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  protected readonly store = inject(UserStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  protected searchValue = '';
  protected selectedRole: UserRole | null = null;
  protected selectedActive: boolean | null = null;

  protected readonly roleOptions = [
    { label: 'Todos los roles', value: null },
    { label: 'Admin', value: 'admin' as UserRole },
    { label: 'Usuario', value: 'user' as UserRole },
    { label: 'Invitado', value: 'guest' as UserRole },
  ];

  protected readonly activeOptions = [
    { label: 'Todos', value: null },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false },
  ];

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(query => this.store.setSearch(query));
  }

  onSearch(value: string): void {
    this.searchInput$.next(value);
  }

  onRoleChange(role: UserRole | null): void {
    this.store.setRoleFilter(role);
  }

  onActiveChange(active: boolean | null): void {
    this.store.setActiveFilter(active);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.store.pageSize();
    this.store.setPage(Math.floor(first / rows) + 1);
  }

  navigateToNew(): void {
    this.router.navigate(['/users/new']);
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/users', id]);
  }

  editUser(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/users', id, 'edit']);
  }

  roleSeverity(role: UserRole): 'success' | 'info' | 'secondary' {
    const map: Record<UserRole, 'success' | 'info' | 'secondary'> = {
      admin: 'success',
      user: 'info',
      guest: 'secondary',
    };
    return map[role];
  }
}
