import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UserStore } from '../../store/user.store';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-detail',
  imports: [DatePipe, ButtonModule, TagModule, SkeletonModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  readonly id = input.required<string>();

  protected readonly store = inject(UserStore);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  ngOnInit(): void {
    this.store.loadUserById(Number(this.id()));
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  editUser(): void {
    this.router.navigate(['/users', this.id(), 'edit']);
  }

  deleteUser(): void {
    const user = this.store.selectedUser();
    if (!user) return;

    this.confirm.confirm({
      message: `¿Eliminar al usuario <strong>${user.username}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await firstValueFrom(this.store.deleteUser(user.id));
          this.toast.add({ severity: 'success', summary: 'Eliminado', detail: `Usuario ${user.username} eliminado.` });
          this.router.navigate(['/users']);
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
