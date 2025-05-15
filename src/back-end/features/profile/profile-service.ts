import { injectableSingleton } from "@/back-end/core/lib/lib-tsyringe";
import { ProfileCache } from "./profile-cache";
import { ProfileRepository } from "./profile-repository";
import { ProfileEventDispatcher } from "@/back-end/core/events/profile-dispatcher";
import { injectDB, type Database } from "@/back-end/core/db/db";
import {
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
  type ProfileDeselectedEventData,
  type ProfileDeselectedEventListener,
  type ProfileSelectedEventData,
  type ProfileSelectedEventListener,
} from "@/back-end/core/events/profile-event";
import {
  CleanupEventToken,
  type CleanupEventListener,
} from "@/back-end/core/events/cleanup-event";
import type {
  ProfileId,
  ProfileInsert,
} from "@/shared/definition/schema/types/types-profiles";
import type { UserId } from "@/shared/definition/schema/types/types-user";
import { ErrorType, ServerError } from "@/shared/socket/socket-errors";

@injectableSingleton(
  ProfileSelectedEventToken,
  ProfileDeselectedEventToken,
  CleanupEventToken
)
export class ProfileService
  implements
    ProfileSelectedEventListener,
    ProfileDeselectedEventListener,
    CleanupEventListener
{
  private readonly dirtyProfiles = new Set<ProfileId>();

  public constructor(
    @injectDB() private readonly db: Database,
    private readonly profileCache: ProfileCache,
    private readonly profileRepo: ProfileRepository,
    private readonly profileDispatcher: ProfileEventDispatcher
  ) {}

  public async getProfilesByUserId(userId: UserId) {
    // As of now we dont cache here since it is unlikely for a user to query all profiles multiple times.
    // It is much more likely they will query all profiles once and then only a single profile from then on out.
    return await this.profileRepo.findByUserId(userId);
  }

  public async getProfileById(profileId: ProfileId) {
    const cache = this.profileCache.getProfileById(profileId);
    if (cache) return cache;

    const profile = await this.profileRepo.findByProfileId(profileId);
    if (!profile) throw new ServerError(ErrorType.ProfileDoesNotExist);
    this.profileCache.storeProfile(profile);
    return profile;
  }

  public async requireUserHasAccess(userId: string, profileId: string) {
    if (!await this.profileRepo.userHasAccess(profileId, userId)){
      throw new ServerError(ErrorType.InsufficientPermissions, "Either profile does not exist, or you lack access to it.");
    }
  }

  public async create(userId: UserId, data: ProfileInsert) {
    const profile = await this.db.transaction(
      async (tx) => await this.profileRepo.create(userId, data, tx)
    );
    if (!profile) throw new ServerError(ErrorType.NameTaken);
    this.profileCache.storeProfile(profile);
    this.profileDispatcher.emitProfileCreated({ userId, profile });
    return profile;
  }

  public async delete(userId: UserId, profileId: ProfileId) {
    await this.db.transaction(
      async (tx) => await this.profileRepo.delete(profileId, tx)
    );
    this.profileCache.invalidateProfile(profileId);
    this.profileDispatcher.emitProfileDeleted({ userId, profileId });
  }

  public update(profileId: ProfileId) {
    this.dirtyProfiles.add(profileId);
  }

  public async onProfileSelected({
    profileId,
  }: ProfileSelectedEventData): Promise<void> {
    const profile = await this.profileRepo.findByProfileId(profileId);
    if (profile) this.profileCache.storeProfile(profile);
  }
  public async onProfileDeselected({
    profileId,
  }: ProfileDeselectedEventData): Promise<void> {
    const profile = this.profileCache.getProfileById(profileId);
    if (!profile) return;
    await this.db.transaction(async (tx) =>
      this.profileRepo.update(profileId, profile, tx)
    );
    this.profileCache.invalidateProfile(profileId);
  }

  public async cleanup(): Promise<void> {
    try {
      const profileIds = this.profileCache.getProfileIds().toArray();
      await this.db.transaction(async (tx) => {
        await this.profileRepo.updateTimes(profileIds, tx);
      });
    } catch (error) {
      console.error(`Failed updating times for all profiles`, error);
    }

    try {
      await this.db.transaction(async (tx) => {
        for (const profileId of this.dirtyProfiles) {
          const profile = this.profileCache.getProfileById(profileId);
          if (profile) await this.profileRepo.update(profileId, profile, tx);
        }
      });
      this.dirtyProfiles.clear();
    } catch (error) {
      console.error(`Failed updating all dirty profiles.`, error);
    }
  }
}
