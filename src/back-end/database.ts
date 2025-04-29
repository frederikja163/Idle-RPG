import { drizzle } from "drizzle-orm/libsql";
import {
  inventoryTable,
  profileTable,
  userProfileTable,
  userTable,
} from "./db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { ItemType } from "@/shared/socket-events";

export type UserId = number;
export type ProfileId = number;

export class Database {
  private readonly _db = drizzle(process.env.DB_FILE_NAME!);

  public async upsertUser(
    googleId: string,
    email: string,
    profilePicture: string
  ) {
    const users = await this._db
      .insert(userTable)
      .values({ googleId, email, profilePicture })
      .onConflictDoUpdate({
        target: userTable.googleId,
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
      .update(userTable)
      .set({
        lastLogin: sql`CURRENT_TIMESTAMP`,
      })
      .where(inArray(userTable.id, userIds));
  }

  public async createProfile(userId: UserId, name: string) {
    return await this._db.transaction(async (tx) => {
      const profiles = await tx
        .insert(profileTable)
        .values({ name })
        .onConflictDoNothing({
          target: profileTable.name,
        })
        .returning();
      const profile = profiles.length == 1 ? profiles[0] : null;
      if (!profile) return null;
      await tx
        .insert(userProfileTable)
        .values({ user: userId, profile: profile.id });
      return profile;
    });
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

  public async deleteProfile(profileId: ProfileId) {
    await this._db.delete(profileTable).where(eq(profileTable.id, profileId));
  }

  public async updateProfile(
    profileId: ProfileId,
    data: Partial<typeof profileTable.$inferSelect>
  ) {
    await this._db
      .update(profileTable)
      .set(data)
      .where(eq(profileTable.id, profileId));
  }

  public async updateProfiles(profiles: typeof profileTable.$inferSelect[]) {
    await this._db.transaction(async (tx) => {
      for (const profile of profiles) {
        await tx.update(profileTable)
        .set(profile)
        .where(eq(profileTable.id, profile.id));
      }
    })
  }

  public async updateProfileTimes(profileIds: ProfileId[]){
    await this._db.update(profileTable).set({
      lastLogin: sql`CURRENT_TIMESTAMP`,
    }).where(inArray(profileTable.id, profileIds));
  }

  public async getInventory(profileId: ProfileId) {
    const items = await this._db
      .select({ itemId: inventoryTable.itemId, count: inventoryTable.count })
      .from(inventoryTable)
      .where(eq(inventoryTable.profileId, profileId))
      .orderBy(inventoryTable.index);
    return items;
  }

  public async saveInventory(profileId: ProfileId, items: ItemType[]) {
    await this._db.transaction(async (tx) => {
      await tx
        .delete(inventoryTable)
        .where(eq(inventoryTable.profileId, profileId));

      await tx.insert(inventoryTable).values(
        items.map((item, index) => ({
          profileId,
          itemId: item.itemId,
          count: item.count,
          index,
        }))
      );
    });
  }
}

export const database = new Database();

export function initDb() {}
