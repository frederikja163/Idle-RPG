import { injectAll } from 'tsyringe';
import type { SocketId } from '../server/sockets/sockets.types';
import type { UserId } from '../db/db.types';
import {
  UserLoginEventToken,
  UserLogoutEventToken,
  type UserLoginEventListener,
  type UserLogoutEventListener,
} from './user.event';
import { injectableSingleton } from '../lib/lib.tsyringe';

@injectableSingleton()
export class UserEventDispatcher {
  public constructor(
    @injectAll(UserLoginEventToken, { isOptional: true })
    private readonly loginListeners: UserLoginEventListener[],
    @injectAll(UserLogoutEventToken, { isOptional: true })
    private readonly logoutListeners: UserLogoutEventListener[],
  ) {
    this.loginListeners = this.loginListeners.filter((l) => l.onUserLoggedIn);
    console.log('Login listeners: ', this.loginListeners.length);
    this.logoutListeners = this.logoutListeners.filter((l) => l.onUserLoggedOut);
    console.log('Logout listeners: ', this.logoutListeners.length);
  }

  public emitUserLoggedIn(socketId: SocketId, userId: UserId) {
    for (const listener of this.loginListeners) {
      listener.onUserLoggedIn(socketId, userId);
    }
  }

  public emitUserLoggedOut(socketId: SocketId, userId: UserId) {
    for (const listener of this.logoutListeners) {
      listener.onUserLoggedOut(socketId, userId);
    }
  }
}
