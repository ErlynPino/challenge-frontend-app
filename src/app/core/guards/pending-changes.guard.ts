import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate(): boolean;
}

/**
 * Prevents accidental navigation away from a form with unsaved changes.
 * The component must implement `canDeactivate(): boolean`.
 */
export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component.canDeactivate?.()) {
    return true;
  }
  return window.confirm('¿Seguro que deseas salir? Los cambios no guardados se perderán.');
};
