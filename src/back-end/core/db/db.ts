import { drizzle } from 'drizzle-orm/libsql';
import { items } from './schema/schema.items';
import { profiles } from './schema/schema.profiles';
import { skills } from './schema/schema.skills';
import { userProfileRelations } from './schema/schema.userprofiles';
import { users } from './schema/schema.users';
import { container, inject } from 'tsyringe';
import type { SQLiteTableWithColumns, SQLiteTransaction } from 'drizzle-orm/sqlite-core';

const schema = {
  usersTable: users,
  profilesTable: profiles,
  userProfileRelations,
  itemsTable: items,
  skillsTable: skills,
};
export const db = drizzle(process.env.DB_FILE_NAME!);
export type Database = typeof db;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
export class DatabaseToken {}
container.register(DatabaseToken, { useValue: db });
export function injectDB() {
  return inject(DatabaseToken);
}
