import { container, injectAll } from 'tsyringe';
import type { SocketId } from '../server/sockets/socket.types';
import type { UserId } from '../db/db.types';
import {
  UserLoginEventToken,
  UserLogoutEventToken,
  type UserLoginEventData,
  type UserLoginEventListener,
  type UserLogoutEventData,
  type UserLogoutEventListener,
} from './user.event';
import { injectableSingleton } from '../lib/lib.tsyringe';

@injectableSingleton()
export class UserEventDispatcher {
  public emitUserLoggedIn(event: UserLoginEventData) {
    const listeners = container.resolveAll<UserLoginEventListener>(UserLoginEventToken).filter((l) => l.onUserLoggedIn);
    for (const listener of listeners) {
      listener.onUserLoggedIn(event);
    }
  }

  public emitUserLoggedOut(event: UserLogoutEventData) {
    const listeners = container
      .resolveAll<UserLogoutEventListener>(UserLogoutEventToken)
      .filter((l) => l.onUserLoggedOut);
    for (const listener of listeners) {
      listener.onUserLoggedOut(event);
    }
  }
}
