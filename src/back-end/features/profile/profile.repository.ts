import { InjectDB, type Database } from '@/back-end/core/db/db';
import type { OmitAutoFields, ProfileType } from '@/back-end/core/db/db.types';
import { profiles } from '@/back-end/core/db/schema/schema.profiles';
import { userProfiles } from '@/back-end/core/db/schema/schema.userprofiles';
import { users } from '@/back-end/core/db/schema/schema.users';
import { eq, inArray, sql } from 'drizzle-orm';
import { injectable, singleton } from 'tsyringe';

@injectable()
@singleton()
export class ProfileRepository {
  public constructor(@InjectDB() private readonly db: Database) {}

  public async create(userId: number, data: OmitAutoFields<ProfileType>): Promise<ProfileType | null> {
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

  public async findByUserId(userId: number): Promise<ProfileType[]> {
    try {
      return (
        await this.db
          .select()
          .from(users)
          .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
          .innerJoin(profiles, eq(userProfiles.profileId, profiles.id))
          .where(eq(users.id, userId))
          .orderBy(profiles.id)
      ).map((r) => r.profiles);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async update(profileId: number, data: Partial<OmitAutoFields<ProfileType>>) {
    try {
      await this.db.update(profiles).set(data).where(eq(profiles.id, profileId)).returning();
    } catch (error) {
      console.error(error);
    }
  }

  public async updateTimes(profileIds: number[]) {
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
