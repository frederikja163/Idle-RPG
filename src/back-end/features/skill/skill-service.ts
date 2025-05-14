import { injectableSingleton } from "@/back-end/core/lib/lib-tsyringe";
import { SkillCache } from "./skill-cache";
import { SkillRepository } from "./skill-repository";
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
import { Lookup } from "@/shared/lib/lookup";
import type { ProfileId } from "@/shared/definition/schema/types/types-profiles";
import type {
  Skill,
  SkillId,
} from "@/shared/definition/schema/types/types-skills";

@injectableSingleton(
  ProfileSelectedEventToken,
  ProfileDeselectedEventToken,
  CleanupEventToken
)
export class SkillService
  implements
    ProfileSelectedEventListener,
    ProfileDeselectedEventListener,
    CleanupEventListener
{
  private readonly dirtySkills = new Lookup<ProfileId, SkillId>();
  private readonly profilesToRemove = new Set<ProfileId>();

  public constructor(
    @injectDB() private readonly db: Database,
    private readonly skillCache: SkillCache,
    private readonly skillRepo: SkillRepository
  ) {}

  public async getSkillsByProfileId(profileId: ProfileId): Promise<Skill[]> {
    const cache = this.skillCache
      .getSkillsByProfileId(profileId)
      ?.values()
      .toArray();
    if (cache) return cache;

    const skills = (await this.skillRepo.getSkillsByProfileId(profileId)) ?? [];
    skills.forEach(this.skillCache.store.bind(this.skillCache));
    return skills;
  }

  public async getSkillById(profileId: ProfileId, skillId: SkillId) {
    if (!this.skillCache.hasProfileId(profileId)) {
      const skills =
        (await this.skillRepo.getSkillsByProfileId(profileId)) ?? [];
      skills.forEach(this.skillCache.store.bind(this.skillCache));
    }

    const cache = this.skillCache.getSkillById(profileId, skillId);
    if (cache) return cache;
    const skill = { profileId, skillId, xp: 0, level: 0 };
    this.skillCache.store(skill);
    return skill;
  }

  public update(profileId: ProfileId, skillId: SkillId) {
    this.dirtySkills.add(profileId, skillId);
  }

  public async onProfileSelected({
    profileId,
  }: ProfileSelectedEventData): Promise<void> {
    if (this.skillCache.hasProfileId(profileId)) return;
    const skills = await this.skillRepo.getSkillsByProfileId(profileId);
    skills.forEach(this.skillCache.store.bind(this.skillCache));
  }
  public onProfileDeselected({
    profileId,
  }: ProfileDeselectedEventData): void | Promise<void> {
    this.profilesToRemove.add(profileId);
  }

  public async cleanup(): Promise<void> {
    try {
      await this.db.transaction(async (tx) => {
        for (const [profileId, skillId] of this.dirtySkills.values()) {
          const skill = this.skillCache.getSkillById(profileId, skillId);
          if (skill) {
            await this.skillRepo.update(skill, tx);
          }
        }
      });
      this.dirtySkills.clear();
      this.profilesToRemove.forEach(
        this.skillCache.invalidateCache.bind(this.skillCache)
      );
      this.profilesToRemove.clear();
    } catch (error) {
      console.error(`Failed saving skills`, error);
    }
  }
}
