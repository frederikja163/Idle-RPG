import { injectDB, type Database } from '@/back-end/core/db/db';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';
import { UserRepository } from './user.repository';
import type { UserId } from '@/back-end/core/db/db.types';
import { UserCache } from './user.cache';
import { CleanupEventToken, type CleanupEventListener } from '@/back-end/core/events/cleanup.event';

@injectableSingleton(CleanupEventToken)
export class UserService implements CleanupEventListener {
  public constructor(
    @injectDB() private readonly db: Database,
    private readonly userRepo: UserRepository,
    private readonly userCache: UserCache,
  ) {}

  public async getByUserId(userId: UserId) {
    try {
      const user = this.userCache.getByUserId(userId);
      if (user) return user;
      return await this.userRepo.findById(userId);
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

  public async cleanup(): Promise<void> {
    try {
      const userIds = this.userCache
        .getAllUsers()
        .map((u) => u.id)
        .toArray();
      await this.db.transaction(async (tx) => await this.userRepo.updateTimes(userIds, tx));
    } catch (error) {
      console.error(`Failed saving users.`, error);
    }
  }
}
