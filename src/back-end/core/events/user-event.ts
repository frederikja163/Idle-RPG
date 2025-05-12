import type { UserId } from '@/shared/definition/schema/types/types-user';
import type { InjectionToken } from 'tsyringe';

export type UserLoginEventData = { userId: UserId };
export interface UserLoginEventListener {
  onUserLoggedIn(event: UserLoginEventData): void | Promise<void>;
}
export const UserLoginEventToken: InjectionToken<UserLoginEventListener> = Symbol('UserLogin');

export type UserLogoutEventData = { userId: UserId };
export interface UserLogoutEventListener {
  onUserLoggedOut(event: UserLogoutEventData): void | Promise<void>;
}
export const UserLogoutEventToken: InjectionToken<UserLogoutEventListener> = Symbol('UserLogout');
