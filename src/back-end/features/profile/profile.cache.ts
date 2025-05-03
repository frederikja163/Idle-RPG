import type { ProfileType } from '@/back-end/core/db/db.types';
import { ProfileRepository } from './profile.repository';
import { injectable, singleton } from 'tsyringe';
import type { ICache } from '@/back-end/core/cache';

@injectable()
@singleton()
export class ProfileCache implements ICache {
  private readonly profilesById = new Map<number, WeakRef<ProfileType>>();

  public constructor(private readonly profileRepo: ProfileRepository) {}

  public async findByUserId(userId: number) {
    return await this.profileRepo.findByUserId(userId);
  }

  public async createByName(userId: number, name: string) {
    return await this.profileRepo.create(userId, { name });
  }

  public async cleanup() {
    for (const [profileId, profileRef] of this.profilesById) {
      const profile = profileRef.deref();
      if (profile) this.profileRepo.update(profile.id, profile);
      else this.profilesById.delete(profileId);
    }
  }

  public async deleteProfile(profileId: number) {
    await this.profileRepo.delete(profileId);
  }
}
