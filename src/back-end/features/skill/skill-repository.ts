import { injectDB, type Database, type Transaction } from '@/back-end/core/db/db';
import type { ProfileId, SkillType } from '@/back-end/core/db/db.types';
import { skillsTable } from '@/back-end/core/db/schema/schema-skills';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import type { SkillId } from '@/shared/definition/definition.skills';
import { type InferInsertModel, eq, and } from 'drizzle-orm';

@injectableSingleton()
export class SkillRepository {
  public constructor(@injectDB() private readonly db: Database) {}

  public async getSkillsByProfileId(profileId: ProfileId) {
    return await this.db.select().from(skillsTable).where(eq(skillsTable.profileId, profileId));
  }

  public async create(profileId: ProfileId, skills: Partial<SkillId>[], tx: Transaction) {
    await tx.insert(skillsTable).values(skills.map((s) => ({ skillId: s, profileId })));
  }

  public async update(profileId: ProfileId, skillId: SkillId, skill: SkillType, tx: Transaction) {
    await tx
      .update(skillsTable)
      .set({ ...skill, profileId, skillId })
      .where(and(eq(skillsTable.profileId, profileId), eq(skillsTable.skillId, skillId)));
  }
}
