import type { ProfileId, SkillType } from '@/back-end/core/db/db.types';
import type { SkillId } from '@/shared/definition/definition.skills';
import { Table } from '@/shared/lib/table';

export class SkillCache {
  private readonly skillCache = new Table<ProfileId, SkillId, SkillType>();

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

  public store(profileId: ProfileId, skills: SkillType[]) {
    for (const skill of skills) {
      this.skillCache.add(profileId, skill.skillId, skill);
    }
  }
}
