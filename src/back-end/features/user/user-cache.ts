import type { UserId, UserType } from '@/back-end/core/db/db.types';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';

@injectableSingleton()
export class UserCache {
  private readonly userIdCache = new Map<UserId, UserType>();

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

  public storeUser(user: UserType) {
    this.userIdCache.set(user.id, user);
  }
}
