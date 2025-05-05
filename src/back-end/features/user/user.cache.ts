import type { UserId, UserType } from '@/back-end/core/db/db.types';
import { UserRepository } from './user.repository';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';
import {
  UserLoginEventToken,
  UserLogoutEventToken,
  type UserLoginEventData,
  type UserLoginEventListener,
  type UserLogoutEventData,
  type UserLogoutEventListener,
} from '@/back-end/core/events/user.event';
import { SocketSessionStore } from '@/back-end/core/server/sockets/socket.session.store';

@injectableSingleton(UserLoginEventToken, UserLogoutEventToken)
export class UserCache implements UserLoginEventListener, UserLogoutEventListener {
  private readonly userIdCache = new Map<UserId, UserType>();

  public constructor(
    private readonly sessionStore: SocketSessionStore,
    private readonly userRepository: UserRepository,
  ) {}

  public async getByUserId(userId: UserId) {
    const cache = this.userIdCache.get(userId);
    if (cache) return cache;

    const user = await this.userRepository.findById(userId);
    if (user) {
      this.userIdCache.set(user.id, user);
    }
    return user;
  }

  public getAllUsers() {
    return this.userIdCache.entries().map(([_, u]) => u);
  }

  public invalidateUserCache(userId: UserId) {
    const user = this.userIdCache.get(userId);
    if (!user) return;
    this.userIdCache.delete(userId);
  }

  onUserLoggedIn({ userId }: UserLoginEventData): void | Promise<void> {
    this.userRepository.findById(userId);
  }
  public onUserLoggedOut({ userId }: UserLogoutEventData): void | Promise<void> {
    if (this.sessionStore.anySocketsForUser(userId)) return;
    this.invalidateUserCache(userId);
  }
}
