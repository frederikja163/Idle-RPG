import type { ProfileId, ProfileType, UserId } from '@/back-end/core/db/db.types';
import { ProfileRepository } from './profile.repository';
import { CleanupEventToken, type CleanupEventListener } from '@/back-end/core/events/cleanup.event';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';

@injectableSingleton(ProfileCache, CleanupEventToken)
export class ProfileCache implements CleanupEventListener {
  private readonly userToProfiles = new Map<UserId, WeakRef<ProfileType[]>>();
  private readonly profileIdToProfile = new Map<ProfileId, WeakRef<ProfileType>>();

  public constructor(private readonly profileRepo: ProfileRepository) {}

  public async findByUserId(userId: UserId) {
    const cache = this.userToProfiles.get(userId)?.deref();
    if (cache) return cache;

    const profiles = await this.profileRepo.findByUserId(userId);
    this.userToProfiles.set(userId, new WeakRef(profiles));
    return profiles;
  }

  public async findById(profileId: ProfileId) {
    const cache = this.userToProfiles.get(profileId)?.deref();
    if (cache) return cache;

    const profile = await this.profileRepo.findByProfileId(profileId);
    if (!profile) return null;
    this.profileIdToProfile.set(profile?.id, new WeakRef(profile));
    return profile;
  }

  public async createByName(userId: UserId, name: string) {
    const profile = await this.profileRepo.create(userId, { name });
    if (!profile) return null;
    const profiles = await this.findByUserId(userId);
    profiles.push(profile);
    this.profileIdToProfile.set(profile.id, new WeakRef(profile));
    return profile;
  }

  public async cleanup() {
    for (const [profileId, profileRef] of this.profileIdToProfile) {
      const profile = profileRef.deref();
      if (!profile) this.profileIdToProfile.delete(profileId);
    }
    for (const [userId, profileRef] of this.userToProfiles) {
      const profile = profileRef.deref();
      if (!profile) this.userToProfiles.delete(userId);
    }
  }

  public async deleteProfile(profileId: number) {
    await this.profileRepo.delete(profileId);

    const users = await this.profileRepo.findUsersForProfile(profileId);
    for (const userId of users) {
      if (userId) this.userToProfiles.delete(userId);
    }
  }
}
