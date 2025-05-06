import {
  UserLoginEventToken,
  UserLogoutEventToken,
  type UserLoginEventData,
  type UserLogoutEventData,
  type UserLogoutEventListener,
} from './user.event';
import { injectableSingleton, resolveAll } from '../lib/lib.tsyringe';

@injectableSingleton()
export class UserEventDispatcher {
  public emitUserLoggedIn(event: UserLoginEventData) {
    const listeners = resolveAll(UserLoginEventToken).filter((l) => l.onUserLoggedIn);
    for (const listener of listeners) {
      listener.onUserLoggedIn(event);
    }
  }

  public emitUserLoggedOut(event: UserLogoutEventData) {
    const listeners = resolveAll<UserLogoutEventListener>(UserLogoutEventToken).filter((l) => l.onUserLoggedOut);
    for (const listener of listeners) {
      listener.onUserLoggedOut(event);
    }
  }
}
