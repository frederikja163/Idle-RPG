import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { ProfileCache } from './profile-cache';
import { ProfileRepository } from './profile-repository';
import { ProfileEventDispatcher } from '@/back-end/core/events/profile-dispatcher';
import type { OmitAutoFields, ProfileId, ProfileType, UserId } from '@/back-end/core/db/db.types';
import { injectDB, type Database } from '@/back-end/core/db/db';
import {
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
  type ProfileDeselectedEventData,
  type ProfileDeselectedEventListener,
  type ProfileSelectedEventData,
  type ProfileSelectedEventListener,
} from '@/back-end/core/events/profile-event';
import { CleanupEventToken, type CleanupEventListener } from '@/back-end/core/events/cleanup-event';
import { SkillRepository } from '../skill/skill-repository';
import { skills } from '@/shared/definition/definition.skills';

@injectableSingleton(ProfileSelectedEventToken, ProfileDeselectedEventToken, CleanupEventToken)
export class ProfileService
  implements ProfileSelectedEventListener, ProfileDeselectedEventListener, CleanupEventListener
{
  public constructor(
    @injectDB() private readonly db: Database,
    private readonly profileCache: ProfileCache,
    private readonly profileRepo: ProfileRepository,
    private readonly profileDispatcher: ProfileEventDispatcher,
  ) {}

  public async getProfilesByUserId(userId: UserId) {
    try {
      // As of now we dont cache here since it is unlikely for a user to query all profiles multiple times.
      // It is much more likely they will query all profiles once and then only a single profile from then on out.
      return await this.profileRepo.findByUserId(userId);
    } catch (error) {
      console.error(`Failed to get profiles for user ${userId}`, error);
      return [];
    }
  }

  public async getProfileById(profileId: ProfileId) {
    try {
      const cache = this.profileCache.getProfileById(profileId);
      if (cache) return cache;

      const profile = await this.profileRepo.findByProfileId(profileId);
      if (profile) {
        this.profileCache.storeProfile(profile);
      }
      return profile;
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

  public async delete(userId: UserId, profileId: ProfileId) {
    try {
      await this.db.transaction(async (tx) => await this.profileRepo.delete(profileId, tx));
      this.profileDispatcher.emitProfileDeleted({ userId, profileId });
    } catch (error) {
      console.error(`Failed to delete profile ${profileId}`, error);
    }
  }

  public async onProfileSelected({ profileId }: ProfileSelectedEventData): Promise<void> {
    try {
      const profile = await this.profileRepo.findByProfileId(profileId);
      if (profile) this.profileCache.storeProfile(profile);
    } catch (error) {
      console.error(`Failed to warmup cache for profile ${profileId}`, error);
    }
  }
  public async onProfileDeselected({ profileId }: ProfileDeselectedEventData): Promise<void> {
    try {
      const profile = this.profileCache.getProfileById(profileId);
      if (profile) {
        await this.db.transaction(async (tx) => this.profileRepo.update(profileId, profile, tx));
        this.profileCache.invalidateProfile(profileId);
      }
    } catch (error) {
      console.error(`Failed invalidating cache for profile ${profileId}`, error);
    }
  }

  public async cleanup(): Promise<void> {
    try {
      const profileIds = this.profileCache.getProfileIds().toArray();
      await this.db.transaction(async (tx) => await this.profileRepo.updateTimes(profileIds, tx));
    } catch (error) {
      console.error(`Failed updating times for all profiles`, error);
    }
  }
}
