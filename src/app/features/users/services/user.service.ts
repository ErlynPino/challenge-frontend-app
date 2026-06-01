import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import {
  CreateUserDto,
  DummyJsonUser,
  DummyJsonUsersResponse,
  UpdateUserDto,
  User,
  UserListParams,
  UserListResponse,
  mapDummyJsonUser,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getUsers(params: UserListParams): Observable<UserListResponse> {
    const skip = (params.page - 1) * params.pageSize;

    let httpParams = new HttpParams()
      .set('limit', params.pageSize)
      .set('skip', skip)
      .set('select', 'id,firstName,lastName,username,email,role');

    const url = params.search ? '/users/search' : '/users';
    if (params.search) httpParams = httpParams.set('q', params.search);

    return this.http.get<DummyJsonUsersResponse>(url, { params: httpParams }).pipe(
      map(res => ({ users: res.users.map(mapDummyJsonUser), total: res.total })),
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<DummyJsonUser>(`/users/${id}`).pipe(map(mapDummyJsonUser));
  }

  createUser(dto: CreateUserDto): Observable<User> {
    return this.http
      .post<DummyJsonUser>('/users/add', {
        username: dto.username,
        email: dto.email,
        firstName: dto.first_name,
        lastName: dto.last_name,
        role: dto.role,
      })
      .pipe(map(raw => ({ ...mapDummyJsonUser(raw), active: dto.active })));
  }

  updateUser(id: number, dto: UpdateUserDto): Observable<User> {
    const body: Record<string, unknown> = {};
    if (dto.username !== undefined) body['username'] = dto.username;
    if (dto.email !== undefined) body['email'] = dto.email;
    if (dto.first_name !== undefined) body['firstName'] = dto.first_name;
    if (dto.last_name !== undefined) body['lastName'] = dto.last_name;
    if (dto.role !== undefined) body['role'] = dto.role;

    return this.http
      .put<DummyJsonUser>(`/users/${id}`, body)
      .pipe(map(raw => ({ ...mapDummyJsonUser(raw), active: dto.active ?? true })));
  }

  deleteUser(id: number): Observable<{ id: number; isDeleted: boolean }> {
    return this.http.delete<{ id: number; isDeleted: boolean }>(`/users/${id}`);
  }
}
