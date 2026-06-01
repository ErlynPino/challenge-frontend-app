import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserStore } from './user.store';
import { ENVIRONMENT } from '../../../tokens/environment.token';
import { User } from '../models/user.model';

const ENV = { production: false, apiUrl: 'https://dummyjson.com' };

const RAW = (id: number, role = 'user') => ({
  id, firstName: 'Test', lastName: 'User',
  username: `user${id}`, email: `u${id}@t.com`, role,
});

describe('UserStore', () => {
  let store: UserStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: ENV },
      ],
    });
    store = TestBed.inject(UserStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should initialise with empty state', () => {
    expect(store.users()).toEqual([]);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.total()).toBe(0);
    expect(store.page()).toBe(1);
  });

  it('loadUsers() populates users on success', () => {
    store.loadUsers();
    expect(store.isLoading()).toBe(true);

    http.expectOne(r => r.url === '/users').flush({
      users: [RAW(1, 'admin'), RAW(2, 'user')],
      total: 2, skip: 0, limit: 10,
    });

    expect(store.isLoading()).toBe(false);
    expect(store.users().length).toBe(2);
    expect(store.total()).toBe(2);
    expect(store.error()).toBeNull();
  });

  it('loadUsers() sets error on HTTP failure', () => {
    store.loadUsers();
    http.expectOne(r => r.url === '/users')
      .flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeTruthy();
    expect(store.users()).toEqual([]);
  });

  it('setRoleFilter() filters users by role via computed signal', () => {
    store.loadUsers();
    http.expectOne(r => r.url === '/users').flush({
      users: [RAW(1, 'admin'), RAW(2, 'user')],
      total: 2, skip: 0, limit: 10,
    });

    store.setRoleFilter('admin');
    expect(store.users().length).toBe(1);
    expect(store.users()[0].role).toBe('admin');

    store.setRoleFilter(null);
    expect(store.users().length).toBe(2);
  });

  it('deleteUser() applies optimistic removal then rollbacks on API error', () => {
    store.loadUsers();
    http.expectOne(r => r.url === '/users').flush({
      users: [RAW(1), RAW(2)],
      total: 2, skip: 0, limit: 10,
    });
    expect(store.users().length).toBe(2);

    store.deleteUser(1).subscribe({ error: () => {} });
    expect(store.users().length).toBe(1);
    expect(store.users()[0].id).toBe(2);

    http.expectOne('/users/1').flush('Error', { status: 500, statusText: 'Error' });

    expect(store.users().length).toBe(2);
    expect(store.error()).toBeTruthy();
  });

  it('loadUserById() uses cache when user is already in the list', () => {
    store.loadUsers();
    http.expectOne(r => r.url === '/users').flush({
      users: [RAW(5)], total: 1, skip: 0, limit: 10,
    });

    store.loadUserById(5);
    http.expectNone('/users/5');
    expect(store.selectedUser()?.id).toBe(5);
  });
});
