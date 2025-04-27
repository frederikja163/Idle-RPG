import { drizzle } from "drizzle-orm/libsql";
import {
  inventoryTable,
  profileTable,
  userProfileRelations,
  userProfileTable,
  userTable,
} from "./db/schema";
import { and, eq, sql } from "drizzle-orm";

export type UserId = number;
export type ProfileId = number;

export class Database {
  private readonly _db = drizzle(process.env.DB_FILE_NAME!);

  public async upsertUser(
    googleId: string,
    email: string,
    profilePicture?: string
  ) {
    const users = await this._db
      .insert(userTable)
      .values({ googleId, email, profilePicture })
      .onConflictDoUpdate({
        target: userTable.googleId,
        set: {
          profilePicture: profilePicture,
          lastLogin: sql`(current_timestamp)`,
        },
      })
      .returning();

    const user = users[0];
    return user;
  }

  public async getProfiles(userId: UserId) {
    const profiles = await this._db
      .select()
      .from(userTable)
      .innerJoin(userProfileTable, eq(userTable.id, userProfileTable.user))
      .innerJoin(profileTable, eq(userProfileTable.profile, profileTable.id))
      .where(eq(userTable.id, userId));

    return profiles.map((p) => p.profiles);
  }

  public async createProfile(userId: UserId, name: string) {
    const profiles = await this._db
      .insert(profileTable)
      .values({ name })
      .onConflictDoNothing({
        target: profileTable.name,
      })
      .returning();
    const profile = profiles.length == 1 ? profiles[0] : null;
    if (!profile) return null;
    await this._db
      .insert(userProfileTable)
      .values({ user: userId, profile: profile.id });
    return profile;
  }

  public async deleteProfile(profileId: ProfileId) {
    await this._db.delete(profileTable).where(eq(profileTable.id, profileId));
  }

  public async getInventory(profileId: ProfileId) {
    const items = await this._db
      .select({ itemId: inventoryTable.itemId, count: inventoryTable.count })
      .from(inventoryTable)
      .where(eq(inventoryTable.profileId, profileId))
      .orderBy(inventoryTable.index);
    return items;
  }

  public async setIndex(profileId: ProfileId, index: number, newIndex: number) {
    await this._db
      .update(inventoryTable)
      .set({ index: newIndex })
      .where(
        and(
          eq(inventoryTable.profileId, profileId),
          eq(inventoryTable.index, index)
        )
      );
  }
}

export const database = new Database();

export function initDb() {}
