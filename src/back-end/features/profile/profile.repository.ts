import { injectDB, type Database } from '@/back-end/core/db/db';
import type { OmitAutoFields, ProfileId, ProfileType, UserId } from '@/back-end/core/db/db.types';
import { profiles } from '@/back-end/core/db/schema/schema.profiles';
import { userProfiles } from '@/back-end/core/db/schema/schema.userprofiles';
import { users } from '@/back-end/core/db/schema/schema.users';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';
import { eq, inArray, sql } from 'drizzle-orm';

@injectableSingleton()
export class ProfileRepository {
  public constructor(@injectDB() private readonly db: Database) {}

  public async create(userId: UserId, data: OmitAutoFields<ProfileType>): Promise<ProfileType | null> {
    try {
      return this.db.transaction(async (tx) => {
        const [profile] = await tx
          .insert(profiles)
          .values(data)
          .onConflictDoNothing({ target: profiles.name })
          .returning();
        if (!profile) return null;
        await tx.insert(userProfiles).values({ userId: userId, profileId: profile.id });
        return profile;
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async findByUserId(userId: UserId): Promise<ProfileType[]> {
    try {
      return (
        await this.db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
          .innerJoin(profiles, eq(userProfiles.profileId, profiles.id))
          .orderBy(profiles.id)
      ).map((r) => r.profiles);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async findByProfileId(profileId: ProfileId) {
    try {
      const [profile] = await this.db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);
      return profile;
    } catch (error) {
      return null;
    }
  }

  public async findUsersForProfile(profileId: ProfileId) {
    try {
      return (
        (
          await this.db
            .select({ id: userProfiles.userId })
            .from(profiles)
            .where(eq(profiles.id, profileId))
            .innerJoin(userProfiles, eq(profiles.id, userProfiles.profileId))
        ).map((r) => r.id) ?? null
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async update(profileId: ProfileId, data: Partial<OmitAutoFields<ProfileType>>) {
    try {
      await this.db.update(profiles).set(data).where(eq(profiles.id, profileId)).returning();
    } catch (error) {
      console.error(error);
    }
  }

  public async updateTimes(profileIds: ProfileId[]) {
    await this.db
      .update(profiles)
      .set({
        lastLogin: sql`CURRENT_TIMESTAMP`,
      })
      .where(inArray(profiles.id, profileIds));
  }

  public async delete(profileId: number) {
    try {
      await this.db.delete(profiles).where(eq(profiles.id, profileId));
    } catch (error) {
      console.error(error);
    }
  }
}
