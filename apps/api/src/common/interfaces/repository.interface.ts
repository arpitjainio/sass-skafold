import {
  UserWithoutPassword,
  UserWithRoles,
  UserWithSubscriptions,
  Role,
  Subscription,
  WhereClause,
  IncludeClause,
} from '../types';

export interface IBaseRepository<T> {
  findById(id: string, include?: IncludeClause): Promise<T | null>;
  findMany(where?: WhereClause, include?: IncludeClause): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<T>;
  findUnique(where: WhereClause, include?: IncludeClause): Promise<T | null>;
  findFirst(where: WhereClause, include?: IncludeClause): Promise<T | null>;
}

export interface IUserRepository extends IBaseRepository<UserWithoutPassword> {
  findByEmail(email: string): Promise<UserWithoutPassword | null>;
  findWithRoles(id: string): Promise<UserWithRoles | null>;
  findWithSubscriptions(id: string): Promise<UserWithSubscriptions | null>;
}

export interface IRoleRepository extends IBaseRepository<Role> {
  findByName(name: string): Promise<Role | null>;
  findWithUsers(id: string): Promise<Role | null>;
  assignToUser(userId: string, roleId: string): Promise<unknown>;
  removeFromUser(userId: string, roleId: string): Promise<unknown>;
}

export interface ISubscriptionRepository extends IBaseRepository<Subscription> {
  findByUserId(userId: string): Promise<Subscription[]>;
  findByStripeId(stripeSubId: string): Promise<Subscription | null>;
  updateByStripeId(stripeSubId: string, data: Partial<Subscription>): Promise<Subscription>;
  deleteByStripeId(stripeSubId: string): Promise<Subscription>;
}
 