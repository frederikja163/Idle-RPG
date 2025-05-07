import { injectDB, type Database, type Transaction } from '@/back-end/core/db/db';
import type { OmitAutoFields, ProfileId, ProfileType, UserId } from '@/back-end/core/db/db.types';
import { profilesTable } from '@/back-end/core/db/schema/schema-profiles';
import { userProfilesTable } from '@/back-end/core/db/schema/schema-userprofiles';
import { usersTable } from '@/back-end/core/db/schema/schema-users';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { and, count, eq, inArray, sql } from 'drizzle-orm';

@injectableSingleton()
export class ProfileRepository {
  public constructor(@injectDB() private readonly db: Database) {}

  public async create(userId: UserId, data: OmitAutoFields<ProfileType>, tx: Transaction): Promise<ProfileType | null> {
    const [profile] = await tx
      .insert(profilesTable)
      .values(data)
      .onConflictDoNothing({ target: profilesTable.name })
      .returning();
    if (!profile) return null;
    await tx.insert(userProfilesTable).values({ userId: userId, profileId: profile.id });
    return profile;
  }

  public async findByUserId(userId: UserId): Promise<ProfileType[]> {
    return (
      await this.db
        .select()
        .from(userProfilesTable)
        .where(eq(userProfilesTable.userId, userId))
        .innerJoin(profilesTable, eq(userProfilesTable.profileId, profilesTable.id))
        .orderBy(profilesTable.id)
    ).map((r) => r.profiles);
  }

  public async findByProfileId(profileId: ProfileId) {
    const [profile] = await this.db.select().from(profilesTable).where(eq(profilesTable.id, profileId)).limit(1);
    return profile;
  }

  public async userHasAccess(profileId: ProfileId, userId: UserId) {
    return await this.db
      .select({})
      .from(userProfilesTable)
      .where(and(eq(userProfilesTable.profileId, profileId), eq(userProfilesTable.userId, userId)))
      .limit(1);
  }

  public async update(profileId: ProfileId, data: Partial<OmitAutoFields<ProfileType>>, tx: Transaction) {
    await tx.update(profilesTable).set(data).where(eq(profilesTable.id, profileId)).returning();
  }

  public async updateTimes(profileIds: ProfileId[], tx: Transaction) {
    await tx
      .update(profilesTable)
      .set({
        lastLogin: sql`CURRENT_TIMESTAMP`,
      })
      .where(inArray(profilesTable.id, profileIds));
  }

  public async delete(profileId: ProfileId, tx: Transaction) {
    await tx.delete(profilesTable).where(eq(profilesTable.id, profileId));
  }
}
