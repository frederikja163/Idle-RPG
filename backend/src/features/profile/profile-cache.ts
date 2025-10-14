import { injectableSingleton } from '@/backend/core/lib/lib-tsyringe';
import type { Profile, ProfileId } from '@/shared/definition/schema/types/types-profiles';

@injectableSingleton()
export class ProfileCache {
  private readonly profileCache = new Map<ProfileId, Profile>();

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

  public storeProfile(profile: Profile) {
    this.profileCache.set(profile.id, profile);
  }
}
