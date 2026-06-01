export type UserRole = 'admin' | 'user' | 'guest';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface CreateUserDto {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  active: boolean;
}

export type UpdateUserDto = Partial<CreateUserDto>;

export interface UserListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
}

// ── DummyJSON internal DTOs ─────────────────────────────────────────────────

export interface DummyJsonUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
}

export interface DummyJsonUsersResponse {
  users: DummyJsonUser[];
  total: number;
  skip: number;
  limit: number;
}

// ── Mapping ─────────────────────────────────────────────────────────────────

const VALID_ROLES: UserRole[] = ['admin', 'user', 'guest'];

export function mapDummyJsonUser(raw: DummyJsonUser): User {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    first_name: raw.firstName,
    last_name: raw.lastName,
    role: VALID_ROLES.includes(raw.role as UserRole) ? (raw.role as UserRole) : 'user',
    created_at: new Date(2024, 0, raw.id % 365 || 1).toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
  };
}
