import { drizzle } from 'drizzle-orm/libsql';
import { itemsTable } from '../../../shared/definition/schema/db/db-items';
import { profilesTable } from '../../../shared/definition/schema/db/db-profiles';
import { skillsTable } from '../../../shared/definition/schema/db/db-skills';
import { userProfileRelations } from '../../../shared/definition/schema/db/db-userprofiles';
import { usersTable } from '../../../shared/definition/schema/db/db-users';
import { container, inject } from 'tsyringe';

const schema = {
  usersTable: usersTable,
  profilesTable: profilesTable,
  userProfileRelations,
  itemsTable: itemsTable,
  skillsTable: skillsTable,
};
export const db = drizzle(process.env.DB_FILE_NAME!, { schema });
export type Database = typeof db;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
export class DatabaseToken {}
container.register(DatabaseToken, { useValue: db });
export function injectDB() {
  return inject(DatabaseToken);
}
