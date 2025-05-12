import { injectDB, type Database, type Transaction } from '@/back-end/core/db/db';
import { skillsTable } from '@/shared/definition/schema/db/db-skills';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills';
import { and, eq } from 'drizzle-orm';

@injectableSingleton()
export class SkillRepository {
  public constructor(@injectDB() private readonly db: Database) {}

  public async getSkillsByProfileId(profileId: ProfileId) {
    return await this.db.select().from(skillsTable).where(eq(skillsTable.profileId, profileId));
  }

  public async getSkillById(profileId: ProfileId, skillId: SkillId) {
    return await this.db
      .select()
      .from(skillsTable)
      .where(and(eq(skillsTable.profileId, profileId), eq(skillsTable.skillId, skillId)));
  }

  public async create(profileId: ProfileId, skills: Partial<SkillId>[], tx: Transaction) {
    await tx.insert(skillsTable).values(skills.map((s) => ({ skillId: s, profileId })));
  }

  public async update(profileId: ProfileId, skillId: SkillId, skill: Skill, tx: Transaction) {
    await tx
      .update(skillsTable)
      .set({ ...skill, profileId, skillId })
      .where(and(eq(skillsTable.profileId, profileId), eq(skillsTable.skillId, skillId)));
  }
}
