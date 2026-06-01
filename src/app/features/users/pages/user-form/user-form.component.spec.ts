import { AbstractControl, FormControl } from '@angular/forms';

function noWhitespaceValidator(control: AbstractControl) {
  return control.value && /\s/.test(control.value) ? { noWhitespace: true } : null;
}

function roleValidator(validRoles: string[]) {
  return (control: AbstractControl) =>
    validRoles.includes(control.value) ? null : { invalidRole: true };
}

describe('UserForm validators', () => {
  describe('noWhitespaceValidator', () => {
    it('should return null for a value without spaces', () => {
      expect(noWhitespaceValidator(new FormControl('jdoe'))).toBeNull();
    });

    it('should return error for a value with spaces', () => {
      expect(noWhitespaceValidator(new FormControl('j doe'))).toEqual({ noWhitespace: true });
    });

    it('should return null for empty value (handled by required)', () => {
      expect(noWhitespaceValidator(new FormControl(''))).toBeNull();
    });
  });

  describe('roleValidator', () => {
    const validate = roleValidator(['admin', 'user', 'guest']);

    it('should return null for valid roles', () => {
      expect(validate(new FormControl('admin'))).toBeNull();
      expect(validate(new FormControl('user'))).toBeNull();
      expect(validate(new FormControl('guest'))).toBeNull();
    });

    it('should return error for an invalid role', () => {
      expect(validate(new FormControl('superadmin'))).toEqual({ invalidRole: true });
      expect(validate(new FormControl(''))).toEqual({ invalidRole: true });
    });
  });
});

describe('mapDummyJsonUser', () => {
  it('should map firstName/lastName and default active to true', async () => {
    const { mapDummyJsonUser } = await import('../../models/user.model');
    const result = mapDummyJsonUser({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'jdoe',
      email: 'jdoe@example.com',
      role: 'admin',
    });
    expect(result.first_name).toBe('John');
    expect(result.last_name).toBe('Doe');
    expect(result.active).toBe(true);
    expect(result.role).toBe('admin');
  });

  it('should default role to "user" when unknown role provided', async () => {
    const { mapDummyJsonUser } = await import('../../models/user.model');
    const result = mapDummyJsonUser({
      id: 2, firstName: 'X', lastName: 'Y', username: 'xy', email: 'x@y.com', role: 'moderator',
    });
    expect(result.role).toBe('user');
  });
});
