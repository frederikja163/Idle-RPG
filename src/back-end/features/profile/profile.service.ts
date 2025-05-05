import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';
import { ProfileCache } from './profile.cache';
import { ProfileRepository } from './profile.repository';
import { ProfileEventDispatcher } from '@/back-end/core/events/profile.dispatcher';
import type { OmitAutoFields, ProfileId, ProfileType, UserId } from '@/back-end/core/db/db.types';
import { injectDB, type Database } from '@/back-end/core/db/db';

@injectableSingleton()
export class ProfileService {
  public constructor(
    @injectDB() private readonly db: Database,
    private readonly profileCache: ProfileCache,
    private readonly profileRepo: ProfileRepository,
    private readonly profileDispatcher: ProfileEventDispatcher,
  ) {}

  public async getProfilesByUserId(userId: UserId) {
    try {
      return this.profileCache.getProfilesByUserId(userId);
    } catch (error) {
      console.error(`Failed to get profiles for user ${userId}`, error);
      return [];
    }
  }

  public async getProfileById(profileId: ProfileId) {
    try {
      return this.profileCache.getProfilesById(profileId);
    } catch (error) {
      console.error(`Failed to to get profile ${profileId}`, error);
      return null;
    }
  }

  public async create(userId: UserId, data: OmitAutoFields<ProfileType>) {
    try {
      const profile = await this.db.transaction(async (tx) => await this.profileRepo.create(userId, data, tx));
      if (profile) this.profileDispatcher.emitProfileCreated({ userId, profile });
      return profile;
    } catch (error) {
      console.error(`Failed to created profile for ${userId}`, error);
      return null;
    }
  }

  public async update(profileId: ProfileId, data: OmitAutoFields<ProfileType>) {
    try {
      await this.db.transaction(async (tx) => await this.profileRepo.update(profileId, data, tx));
    } catch (error) {
      console.error(`Failed to update user ${profileId}`, error);
    }
  }

  public async delete(userId: UserId, profileId: ProfileId) {
    try {
      await this.db.transaction(async (tx) => await this.profileRepo.delete(profileId, tx));
      this.profileDispatcher.emitProfileDeleted({ userId, profileId });
    } catch (error) {
      console.error(`Failed to delete profile ${profileId}`, error);
    }
  }
}
