import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("users", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  googleId: text("google_id").notNull().unique(),
  email: text("email").notNull().unique(),
  profilePicture: text("profile_picture"),
  firstLogin: int("first_login", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(current_timestamp)`),
  lastLogin: int("last_login", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(current_timestamp)`),
});
