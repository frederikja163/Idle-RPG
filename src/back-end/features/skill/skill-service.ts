import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { SkillCache } from './skill-cache';
import { SkillRepository } from './skill-repository';
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
import type { ProfileId } from '@/back-end/core/db/db.types';
import type { SkillId } from '@/shared/definition/definition.skills';
import { Lookup } from '@/shared/lib/lookup';

@injectableSingleton(ProfileSelectedEventToken, ProfileDeselectedEventToken, CleanupEventToken)
export class SkillService
  implements ProfileSelectedEventListener, ProfileDeselectedEventListener, CleanupEventListener
{
  private readonly dirtyProfiles = new Lookup<ProfileId, SkillId>();
  private readonly profilesToRemove = new Set<ProfileId>();

  public constructor(
    @injectDB() private readonly db: Database,
    private readonly skillCache: SkillCache,
    private readonly skillRepo: SkillRepository,
  ) {}

  public async getSkillsByProfileId(profileId: ProfileId) {
    try {
      const cache = this.skillCache.getSkillsByProfileId(profileId);
      if (cache) return cache;

      const skills = await this.skillRepo.getSkillsByProfileId(profileId);
      if (skills) {
        this.skillCache.store(profileId, skills);
      }
      return skills;
    } catch (error) {
      console.error(`Failed getting skills for profile ${profileId}`, error);
    }
  }

  public async getSkillById(profileId: ProfileId, skillId: SkillId) {
    try {
      const cache = this.skillCache.getSkillById(profileId, skillId);
      if (cache) return cache;

      const skills = await this.skillRepo.getSkillsByProfileId(profileId);
      if (skills) {
        this.skillCache.store(profileId, skills);
      }
      return this.skillCache.getSkillById(profileId, skillId);
    } catch (error) {
      console.error(`Failed getting skill by id ${profileId} ${skillId}`, error);
    }
  }

  public async onProfileSelected({ profileId }: ProfileSelectedEventData): Promise<void> {
    if (!this.skillCache.hasProfileId(profileId)) return;
    const skills = await this.skillRepo.getSkillsByProfileId(profileId);
    if (skills) this.skillCache.store(profileId, skills);
  }
  public onProfileDeselected({ profileId }: ProfileDeselectedEventData): void | Promise<void> {
    this.profilesToRemove.add(profileId);
  }

  public async cleanup(): Promise<void> {
    const profileSkills = this.dirtyProfiles.entries().toArray();
    const profilesToRemove = Array.from(this.profilesToRemove);

    try {
      this.dirtyProfiles.clear();
      this.profilesToRemove.clear();
      await this.db.transaction(async (tx) => {
        for (const [profileId, skillId] of profileSkills) {
          const skill = this.skillCache.getSkillById(profileId, skillId);
          if (skill) {
            this.skillRepo.update(profileId, skillId, skill, tx);
          }
        }
      });
      profilesToRemove.forEach(this.skillCache.invalidateCache);
    } catch (error) {
      console.error(`Failed to save cached skill changes`, error);
    }
  }
}
