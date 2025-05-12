import type { profilesTable } from '../db/db-profiles';

export type Profile = typeof profilesTable.$inferSelect;
export type ProfileId = string;
export type ProfileInsert = typeof profilesTable.$inferInsert;
