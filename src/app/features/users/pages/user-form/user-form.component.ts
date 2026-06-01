import { Component, OnInit, computed, inject, input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { UserStore } from '../../store/user.store';
import { UserRole } from '../../models/user.model';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { CanComponentDeactivate } from '../../../../core/guards/pending-changes.guard';

function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  return control.value && /\s/.test(control.value) ? { noWhitespace: true } : null;
}

function roleValidator(validRoles: UserRole[]) {
  return (control: AbstractControl): ValidationErrors | null => {
    return validRoles.includes(control.value) ? null : { invalidRole: true };
  };
}

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    MessageModule,
    TranslatePipe,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit, CanComponentDeactivate {
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  protected readonly store = inject(UserStore);
  private readonly i18n = inject(I18nService);

  protected readonly VALID_ROLES: UserRole[] = ['admin', 'user', 'guest'];
  protected readonly roleOptions = computed(() => [
    { label: this.i18n.t('common.admin'), value: 'admin' },
    { label: this.i18n.t('common.user'), value: 'user' },
    { label: this.i18n.t('common.guest'), value: 'guest' },
  ]);

  protected form!: FormGroup;

  get isEditMode(): boolean {
    return !!this.id();
  }

  canDeactivate(): boolean {
    return !this.form?.dirty;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), noWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      role: ['user', [Validators.required, roleValidator(this.VALID_ROLES)]],
      active: [true],
    });

    if (this.isEditMode) {
      this.store.loadUserById(Number(this.id()));
    }
  }

  ngDoCheck(): void {
    const user = this.store.selectedUser();
    if (this.isEditMode && user && this.form.pristine && !this.form.get('username')?.value) {
      this.form.patchValue({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        active: user.active,
      });
    }
  }

  protected fieldError(field: string): string | null {
    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return null;

    if (ctrl.hasError('required')) return 'Este campo es requerido';
    if (ctrl.hasError('minlength'))
      return `Mínimo ${ctrl.getError('minlength').requiredLength} caracteres`;
    if (ctrl.hasError('email')) return 'Formato de email inválido';
    if (ctrl.hasError('noWhitespace')) return 'No puede contener espacios';
    if (ctrl.hasError('invalidRole')) return 'Rol inválido';
    return null;
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.form.getRawValue();

    try {
      if (this.isEditMode) {
        await firstValueFrom(this.store.updateUser(Number(this.id()), dto));
        this.toast.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'Usuario actualizado correctamente.',
        });
      } else {
        await firstValueFrom(this.store.createUser(dto));
        this.toast.add({
          severity: 'success',
          summary: 'Creado',
          detail: 'Usuario creado correctamente.',
        });
      }
      this.router.navigate(['/users']);
    } catch {
      this.toast.add({
        severity: 'error',
        summary: 'Error',
        detail: this.store.error() ?? 'Ocurrió un error inesperado.',
      });
    }
  }

  protected goBack(): void {
    if (this.isEditMode) {
      this.router.navigate(['/users', this.id()]);
    } else {
      this.router.navigate(['/users']);
    }
  }
}
