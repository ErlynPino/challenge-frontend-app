import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { UserStore } from '../../store/user.store';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-detail',
  imports: [DatePipe, ButtonModule, TagModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  readonly id = input.required<string>();

  protected readonly store = inject(UserStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store.loadUserById(Number(this.id()));
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  editUser(): void {
    this.router.navigate(['/users', this.id(), 'edit']);
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
