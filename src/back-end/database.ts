import { drizzle } from "drizzle-orm/libsql";
import { profileTable, userProfileTable, userTable } from "./db/schema";
import { eq, sql } from "drizzle-orm";

export type UserId = number;

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
}

export const database = new Database();

export function initDb() {}
