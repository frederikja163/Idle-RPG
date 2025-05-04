import { drizzle } from 'drizzle-orm/libsql';
import { items } from './schema/schema.items';
import { profiles } from './schema/schema.profiles';
import { skills } from './schema/schema.skills';
import { userProfileRelations } from './schema/schema.userprofiles';
import { users } from './schema/schema.users';
import { container, inject } from 'tsyringe';

export const db = drizzle(process.env.DB_FILE_NAME!, {
  schema: { usersTable: users, profilesTable: profiles, userProfileRelations, itemsTable: items, skillsTable: skills },
});
export type Database = typeof db;
export class DatabaseToken {}
container.register(DatabaseToken, { useValue: db });
export function injectDB() {
  return inject(DatabaseToken);
}
