import { relations } from 'drizzle-orm';
import { foreignKey, text, primaryKey, sqliteTable } from 'drizzle-orm/sqlite-core';
import { usersTable } from './schema-users';
import { profilesTable } from './schema-profiles';

export const userProfilesTable = sqliteTable(
  'user_profile_relation',
  {
    userId: text('user_id').references(() => usersTable.id),
    profileId: text('profile_id').references(() => profilesTable.id),
  },
  (table) => [
    primaryKey({ name: 'idx', columns: [table.userId, table.profileId] }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profilesTable.id],
    }).onDelete('cascade'),
  ],
);

export const userProfileRelations = relations(userProfilesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userProfilesTable.userId],
    references: [usersTable.id],
  }),
  profile: one(profilesTable, {
    fields: [userProfilesTable.profileId],
    references: [profilesTable.id],
  }),
}));
