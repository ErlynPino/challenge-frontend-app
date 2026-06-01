import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UserStore } from '../../store/user.store';
import { UserRole } from '../../models/user.model';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

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
    SkeletonModule,
    IconField,
    InputIcon,
    TranslatePipe,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  protected readonly store = inject(UserStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  private readonly i18n = inject(I18nService);
  private readonly searchInput$ = new Subject<string>();

  protected searchValue = '';
  protected selectedRole: UserRole | null = null;
  protected selectedActive: boolean | null = null;
  protected readonly skeletonRows = [1, 2, 3, 4, 5];

  protected readonly roleOptions = computed(() => [
    { label: this.i18n.t('common.all-roles'), value: null },
    { label: this.i18n.t('common.admin'), value: 'admin' as UserRole },
    { label: this.i18n.t('common.user'), value: 'user' as UserRole },
    { label: this.i18n.t('common.guest'), value: 'guest' as UserRole },
  ]);

  protected readonly activeOptions = computed(() => [
    { label: this.i18n.t('common.all'), value: null },
    { label: this.i18n.t('common.active'), value: true },
    { label: this.i18n.t('common.inactive'), value: false },
  ]);

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

  deleteUser(id: number, username: string, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      message: `¿Eliminar al usuario <strong>${username}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await firstValueFrom(this.store.deleteUser(id));
          this.toast.add({ severity: 'success', summary: 'Eliminado', detail: `Usuario ${username} eliminado.` });
        } catch {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario.' });
        }
      },
    });
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
