import { drizzle } from 'drizzle-orm/libsql';
import { itemsTable } from './schema/schema-items';
import { profilesTable } from './schema/schema-profiles';
import { skillsTable } from './schema/schema-skills';
import { userProfileRelations } from './schema/schema-userprofiles';
import { usersTable } from './schema/schema-users';
import { container, inject } from 'tsyringe';
import type { SQLiteTableWithColumns, SQLiteTransaction } from 'drizzle-orm/sqlite-core';

const schema = {
  usersTable: usersTable,
  profilesTable: profilesTable,
  userProfileRelations,
  itemsTable: itemsTable,
  skillsTable: skillsTable,
};
export const db = drizzle(process.env.DB_FILE_NAME!);
export type Database = typeof db;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
export class DatabaseToken {}
container.register(DatabaseToken, { useValue: db });
export function injectDB() {
  return inject(DatabaseToken);
}
