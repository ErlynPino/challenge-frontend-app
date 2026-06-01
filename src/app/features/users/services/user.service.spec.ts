import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { ENVIRONMENT } from '../../../tokens/environment.token';

const ENV = { production: false, apiUrl: 'https://dummyjson.com' };

const RAW_USER = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  username: 'jdoe',
  email: 'jdoe@example.com',
  role: 'admin',
};

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: ENV },
      ],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getUsers() should GET /users with correct params and map response', () => {
    let result: { users: unknown[]; total: number } | undefined;

    service.getUsers({ page: 1, pageSize: 10 }).subscribe(r => (result = r));

    const req = http.expectOne(r => r.url === '/users');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('skip')).toBe('0');

    req.flush({ users: [RAW_USER], total: 1, skip: 0, limit: 10 });

    expect(result!.total).toBe(1);
    expect(result!.users[0]).toMatchObject({
      id: 1,
      username: 'jdoe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'jdoe@example.com',
      role: 'admin',
    });
  });

  it('getUsers() should use /users/search when search param is provided', () => {
    service.getUsers({ page: 1, pageSize: 5, search: 'emily' }).subscribe();

    const req = http.expectOne(r => r.url === '/users/search');
    expect(req.request.params.get('q')).toBe('emily');
    req.flush({ users: [], total: 0, skip: 0, limit: 5 });
  });

  it('getUserById() should GET /users/:id and map the user', () => {
    let user: unknown;
    service.getUserById(1).subscribe(u => (user = u));

    const req = http.expectOne('/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(RAW_USER);

    expect(user).toMatchObject({ id: 1, username: 'jdoe', first_name: 'John' });
  });

  it('createUser() should POST /users/add mapping first_name to firstName', () => {
    service.createUser({
      username: 'jdoe',
      email: 'jdoe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'admin',
      active: true,
    }).subscribe();

    const req = http.expectOne('/users/add');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({ firstName: 'John', lastName: 'Doe' });
    req.flush(RAW_USER);
  });

  it('deleteUser() should DELETE /users/:id', () => {
    let result: unknown;
    service.deleteUser(1).subscribe(r => (result = r));

    const req = http.expectOne('/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: 1, isDeleted: true });

    expect(result).toEqual({ id: 1, isDeleted: true });
  });
});
