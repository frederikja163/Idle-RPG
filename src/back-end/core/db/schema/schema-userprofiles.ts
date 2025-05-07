import { relations } from 'drizzle-orm';
import { foreignKey, text, primaryKey, sqliteTable } from 'drizzle-orm/sqlite-core';
import { users } from './schema-users';
import { profiles } from './schema-profiles';

export const userProfiles = sqliteTable(
  'user_profile_relation',
  {
    userId: text('user_id').references(() => users.id),
    profileId: text('profile_id').references(() => profiles.id),
  },
  (table) => [
    primaryKey({ name: 'idx', columns: [table.userId, table.profileId] }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
    }).onDelete('cascade'),
  ],
);

export const userProfileRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
  profile: one(profiles, {
    fields: [userProfiles.profileId],
    references: [profiles.id],
  }),
}));
