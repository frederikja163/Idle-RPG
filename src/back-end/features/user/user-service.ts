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

@injectableSingleton(UserLoginEventToken, UserLogoutEventToken, CleanupEventToken)
export class UserService implements UserLoginEventListener, UserLogoutEventListener, CleanupEventListener {
  public constructor(
    @injectDB() private readonly db: Database,
    private readonly userRepo: UserRepository,
    private readonly userCache: UserCache,
  ) {}

  public async getByUserId(userId: UserId) {
    try {
      const cache = this.userCache.getByUserId(userId);
      if (cache) return cache;

      const user = await this.userRepo.findById(userId);
      if (user) {
        this.userCache.storeUser(user);
      }
    } catch (error) {
      console.error(`Failed to find user by id ${userId}`, error);
    }
  }

  public async getByGoogleId(googleId: string) {
    try {
      return await this.userRepo.findByGoogleId(googleId);
    } catch (error) {
      console.error(`Failed to find user by google id ${googleId}`, error);
    }
  }

  public async createGoogleUser(googleId: string, email: string, profilePicture: string) {
    try {
      return await this.db.transaction(
        async (tx) => await this.userRepo.create({ googleId, email, profilePicture }, tx),
      );
    } catch (error) {
      console.error(`Failed to create google user ${googleId} - ${email}`, error);
    }
  }

  public async deleteUser(userId: UserId) {
    try {
      await this.db.transaction(async (tx) => await this.userRepo.delete(userId, tx));
    } catch (error) {
      console.error(`Failed to delete user ${userId}`, error);
    }
  }

  public async onUserLoggedIn({ userId }: UserLoginEventData): Promise<void> {
    try {
      const user = await this.userRepo.findById(userId);
      if (user) this.userCache.storeUser(user);
    } catch (error) {
      console.error(`Failed warming up cache for user ${userId}`, error);
    }
  }
  public async onUserLoggedOut({ userId }: UserLogoutEventData): Promise<void> {
    try {
      const user = this.userCache.getByUserId(userId);
      if (user) {
        await this.db.transaction(async (tx) => this.userRepo.update(userId, user, tx));
        this.userCache.invalidateUser(userId);
      }
    } catch (error) {
      console.error(`Failed invalidating cache for user ${userId}`, error);
    }
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
