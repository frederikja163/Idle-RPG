import type { InjectionToken } from 'tsyringe';
import type { UserId } from '../db/db.types';
import type { SocketId } from '../server/sockets/socket-types';

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
