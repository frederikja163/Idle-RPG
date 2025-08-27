import { injectDB, type Database, type Transaction } from '@/backend/core/db/db';
import { skillsTable } from '@/shared/definition/schema/db/db-skills';
import { injectableSingleton } from '@/backend/core/lib/lib-tsyringe';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills';
import { and, eq } from 'drizzle-orm';

@injectableSingleton()
export class SkillRepository {
  public constructor(@injectDB() private readonly db: Database) {}

  public async getSkillsByProfileId(profileId: ProfileId) {
    return await this.db.select().from(skillsTable).where(eq(skillsTable.profileId, profileId));
  }

  public async getSkillById(profileId: ProfileId, id: SkillId) {
    return await this.db
      .select()
      .from(skillsTable)
      .where(and(eq(skillsTable.profileId, profileId), eq(skillsTable.id, id)));
  }

  public async update(skill: Skill, tx: Transaction) {
    await tx
      .insert(skillsTable)
      .values(skill)
      .onConflictDoUpdate({
        target: [skillsTable.profileId, skillsTable.id],
        set: skill,
      });
  }
}
