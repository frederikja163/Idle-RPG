import { injectDB, type Database } from '@/back-end/core/db/db';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { UserRepository } from './user-repository';
import { UserCache } from './user-cache';
import {
  UserLoginEventToken,
  UserLogoutEventToken,
  type UserLoginEventData,
  type UserLoginEventListener,
  type UserLogoutEventData,
  type UserLogoutEventListener,
} from '@/back-end/core/events/user-event';
import { CleanupEventToken, type CleanupEventListener } from '@/back-end/core/events/cleanup-event';
import type { UserId } from '@/shared/definition/schema/types/types-user';
import { ErrorType, ServerError } from '@/shared/socket/socket-errors';

@injectableSingleton(UserLoginEventToken, UserLogoutEventToken, CleanupEventToken)
export class UserService implements UserLoginEventListener, UserLogoutEventListener, CleanupEventListener {
  public constructor(
    @injectDB() private readonly db: Database,
    private readonly userRepo: UserRepository,
    private readonly userCache: UserCache,
  ) {}

  public async getByUserId(userId: UserId) {
    const cache = this.userCache.getByUserId(userId);
    if (cache) return cache;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new ServerError(ErrorType.RequiresLogin);
    this.userCache.storeUser(user);
    return user;
  }

  public async getOrCreateByGoogle(googleId: string, email: string, profilePicture: string) {
    const user =
      (await this.userRepo.findByGoogleId(googleId)) ?? (await this.createGoogleUser(googleId, email, profilePicture));
    if (!user) throw new ServerError(ErrorType.InternalError, "Couldn't register user.");
    return user;
  }

  private async createGoogleUser(googleId: string, email: string, profilePicture: string) {
    return await this.db.transaction(async (tx) => await this.userRepo.create({ googleId, email, profilePicture }, tx));
  }

  public async updateUser(userId: UserId) {
    const user = await this.getByUserId(userId);
    await this.db.transaction(async (tx) => {
      this.userRepo.update(userId, user, tx);
    });
  }

  public async deleteUser(userId: UserId) {
    await this.db.transaction(async (tx) => await this.userRepo.delete(userId, tx));
  }

  public async onUserLoggedIn({ userId }: UserLoginEventData): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (user) this.userCache.storeUser(user);
  }
  public async onUserLoggedOut({ userId }: UserLogoutEventData): Promise<void> {
    const user = this.userCache.getByUserId(userId);
    if (!user) return;
    await this.db.transaction(async (tx) => this.userRepo.update(userId, user, tx));
    this.userCache.invalidateUser(userId);
  }

  public async cleanup(): Promise<void> {
    try {
      const userIds = this.userCache.getUserIds().toArray();
      await this.db.transaction(async (tx) => await this.userRepo.updateTimes(userIds, tx));
    } catch (error) {
      console.error(`Failed updating times for all users`, error);
    }
  }
}
