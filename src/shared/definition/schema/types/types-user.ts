import type { usersTable } from '../db/db-users';

export type User = typeof usersTable.$inferSelect;
export type UserId = string;
export type UserInsert = typeof usersTable.$inferInsert;
