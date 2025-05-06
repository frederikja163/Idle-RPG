import type { ProfileId, ProfileType } from '@/back-end/core/db/db.types';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';

@injectableSingleton()
export class ProfileCache {
  private readonly profileCache = new Map<ProfileId, ProfileType>();

  public getProfileIds() {
    return this.profileCache.keys();
  }

  public getProfileById(profileId: ProfileId) {
    return this.profileCache.get(profileId);
  }

  public hasProfile(profileId: ProfileId) {
    return this.profileCache.has(profileId);
  }

  public invalidateProfile(profileId: ProfileId) {
    this.profileCache.delete(profileId);
  }

  public storeProfile(profile: ProfileType) {
    this.profileCache.set(profile.id, profile);
  }
}
