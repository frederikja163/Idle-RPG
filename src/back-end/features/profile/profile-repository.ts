import { injectDB, type Database, type Transaction } from '@/back-end/core/db/db';
import type { OmitAutoFields, ProfileId, ProfileType, UserId } from '@/back-end/core/db/db.types';
import { profiles } from '@/back-end/core/db/schema/schema-profiles';
import { userProfiles } from '@/back-end/core/db/schema/schema-userprofiles';
import { users } from '@/back-end/core/db/schema/schema-users';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { and, count, eq, inArray, sql } from 'drizzle-orm';

@injectableSingleton()
export class ProfileRepository {
  public constructor(@injectDB() private readonly db: Database) {}

  public async create(userId: UserId, data: OmitAutoFields<ProfileType>, tx: Transaction): Promise<ProfileType | null> {
    const [profile] = await tx.insert(profiles).values(data).onConflictDoNothing({ target: profiles.name }).returning();
    if (!profile) return null;
    await tx.insert(userProfiles).values({ userId: userId, profileId: profile.id });
    return profile;
  }

  public async findByUserId(userId: UserId): Promise<ProfileType[]> {
    return (
      await this.db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .innerJoin(profiles, eq(userProfiles.profileId, profiles.id))
        .orderBy(profiles.id)
    ).map((r) => r.profiles);
  }

  public async findByProfileId(profileId: ProfileId) {
    const [profile] = await this.db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);
    return profile;
  }

  public async userHasAccess(profileId: ProfileId, userId: UserId) {
    return await this.db
      .select({})
      .from(userProfiles)
      .where(and(eq(userProfiles.profileId, profileId), eq(userProfiles.userId, userId)))
      .limit(1);
  }

  public async update(profileId: ProfileId, data: Partial<OmitAutoFields<ProfileType>>, tx: Transaction) {
    await tx.update(profiles).set(data).where(eq(profiles.id, profileId)).returning();
  }

  public async updateTimes(profileIds: ProfileId[], tx: Transaction) {
    await tx
      .update(profiles)
      .set({
        lastLogin: sql`CURRENT_TIMESTAMP`,
      })
      .where(inArray(profiles.id, profileIds));
  }

  public async delete(profileId: ProfileId, tx: Transaction) {
    await tx.delete(profiles).where(eq(profiles.id, profileId));
  }
}
