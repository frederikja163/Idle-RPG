import { injectableSingleton } from "@/back-end/core/lib/lib-tsyringe";
import type { ProfileId } from "@/shared/definition/schema/types/types-profiles";
import type {
  Skill,
  SkillId,
} from "@/shared/definition/schema/types/types-skills";
import { Table } from "@/shared/lib/table";

@injectableSingleton()
export class SkillCache {
  private readonly skillCache = new Table<ProfileId, SkillId, Skill>();

  public getSkillsByProfileId(profileId: ProfileId) {
    return this.skillCache.getColumn(profileId);
  }

  public getSkillById(profileId: ProfileId, skillId: SkillId) {
    return this.skillCache.getCell(profileId, skillId);
  }

  public hasProfileId(profileId: ProfileId) {
    return this.skillCache.hasColumn(profileId);
  }

  public hasSkill(profileId: ProfileId, skillId: SkillId) {
    return this.skillCache.hasCell(profileId, skillId);
  }

  public invalidateCache(profileId: string) {
    this.skillCache.deleteColumn(profileId);
  }

  public store(profileId: ProfileId, skills: Skill[]) {
    for (const skill of skills) {
      this.skillCache.add(profileId, skill.skillId, skill);
    }
  }
}
