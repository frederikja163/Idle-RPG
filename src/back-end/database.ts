import { drizzle } from "drizzle-orm/libsql";
import { userTable } from "./db/schema";
import { sql } from "drizzle-orm";

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
        set: { lastLogin: sql`(current_timestamp)` },
      })
      .returning();

    const user = users[0];
    return user;
  }
}

export const database = new Database();
