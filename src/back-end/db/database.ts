import { drizzle } from 'drizzle-orm/libsql';
import { itemsTable, profilesTable, skillsTable, userProfileTable, usersTable } from './schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { ItemType } from '@/shared/socket-events';

export type UserId = number;
export type ProfileId = number;

export class Database {
  private readonly _db = drizzle(process.env.DB_FILE_NAME!);

  public async upsertUser(googleId: string, email: string, profilePicture: string) {
    const users = await this._db
      .insert(usersTable)
      .values({ googleId, email, profilePicture })
      .onConflictDoUpdate({
        target: usersTable.googleId,
        set: {
          profilePicture: profilePicture,
          lastLogin: sql`CURRENT_TIMESTAMP`,
        },
      })
      .returning();

    const user = users[0];
    return user;
  }

  public async updateUsersTime(userIds: UserId[]) {
    await this._db
      .update(usersTable)
      .set({
        lastLogin: sql`CURRENT_TIMESTAMP`,
      })
      .where(inArray(usersTable.id, userIds));
  }

  public async createProfile(userId: UserId, name: string) {
    return await this._db.transaction(async (tx) => {
      const profiles = await tx
        .insert(profilesTable)
        .values({ name })
        .onConflictDoNothing({
          target: profilesTable.name,
        })
        .returning();
      const profile = profiles.length == 1 ? profiles[0] : null;
      if (!profile) return null;
      await tx.insert(userProfileTable).values({ userId: userId, profileId: profile.id });
      return profile;
    });
  }

  public async getProfiles(userId: UserId) {
    const profiles = await this._db
      .select()
      .from(usersTable)
      .innerJoin(userProfileTable, eq(usersTable.id, userProfileTable.userId))
      .innerJoin(profilesTable, eq(userProfileTable.profileId, profilesTable.id))
      .where(eq(usersTable.id, userId));

    return profiles.map((p) => p.profiles);
  }

  public async deleteProfile(profileId: ProfileId) {
    await this._db.delete(profilesTable).where(eq(profilesTable.id, profileId));
  }

  public async updateProfile(profileId: ProfileId, data: Partial<typeof profilesTable.$inferSelect>) {
    await this._db.update(profilesTable).set(data).where(eq(profilesTable.id, profileId));
  }

  public async updateProfiles(profiles: (typeof profilesTable.$inferSelect)[]) {
    await this._db.transaction(async (tx) => {
      for (const profile of profiles) {
        await tx.update(profilesTable).set(profile).where(eq(profilesTable.id, profile.id));
      }
    });
  }

  public async updateProfileTimes(profileIds: ProfileId[]) {
    await this._db
      .update(profilesTable)
      .set({
        lastLogin: sql`CURRENT_TIMESTAMP`,
      })
      .where(inArray(profilesTable.id, profileIds));
  }

  public async getInventory(profileId: ProfileId) {
    const items = await this._db
      .select()
      .from(itemsTable)
      .where(eq(itemsTable.profileId, profileId))
      .orderBy(itemsTable.index);
    return items;
  }

  public async saveInventory(profileId: ProfileId, items: ItemType[]) {
    await this._db.transaction(async (tx) => {
      await tx.delete(itemsTable).where(eq(itemsTable.profileId, profileId));

      await tx.insert(itemsTable).values(
        items.map((item, index) => ({
          profileId,
          itemId: item.itemId,
          count: item.count,
          index,
        })),
      );
    });
  }

  public async getSkills(profileId: ProfileId) {
    const skills = await this._db
      .select()
      .from(skillsTable)
      .where(eq(skillsTable.profileId, profileId))
      .orderBy(skillsTable.skillId);
    return skills;
  }
}

export const database = new Database();

export function initDb() {}
