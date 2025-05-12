import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import type { User, UserId } from '@/shared/definition/schema/types/types-user';

@injectableSingleton()
export class UserCache {
  private readonly userIdCache = new Map<UserId, User>();

  public getUserIds() {
    return this.userIdCache.keys();
  }

  public getByUserId(userId: UserId) {
    return this.userIdCache.get(userId);
  }

  public hasUser(userId: UserId) {
    return this.userIdCache.has(userId);
  }

  public invalidateUser(userId: UserId) {
    this.userIdCache.delete(userId);
  }

  public storeUser(user: User) {
    this.userIdCache.set(user.id, user);
  }
}
