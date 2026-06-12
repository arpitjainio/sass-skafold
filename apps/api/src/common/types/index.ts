import { Request } from 'express';

// Base types
export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  location: string | null;
  notificationPreferences: unknown;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends UserWithoutPassword {
  password: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  createdAt: Date;
  role: Role;
}

export interface UserWithRoles extends UserWithPassword {
  roles: UserRole[];
}

export interface UserWithSubscriptions extends UserWithoutPassword {
  roles: UserRole[];
  subscriptions: Subscription[];
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubId: string;
  status: string;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

// JWT Payload
export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Request types
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

// Repository types - STRICT TYPES
export interface WhereClause {
  [key: string]: unknown;
}

export interface IncludeClause {
  [key: string]: boolean | IncludeClause;
}

// Prisma-specific types
export interface PrismaWhereInput {
  [key: string]: unknown;
}

export interface PrismaIncludeInput {
  [key: string]: boolean | PrismaIncludeInput;
}

export interface PrismaSelectInput {
  [key: string]: boolean | PrismaSelectInput;
}

// HTTP Request/Response types
export interface HttpRequestData {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface HttpResponseData {
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// Exception types
export interface ExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

// API Response types
export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  location: string | null;
  notificationPreferences: NotificationPreferences;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionResponse {
  id: string;
  stripeSubId: string;
  status: string;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

// DTO types
export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  location?: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface CreateSubscriptionData {
  userId: string;
  stripeSubId: string;
  status: string;
  currentPeriodEnd: Date;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
