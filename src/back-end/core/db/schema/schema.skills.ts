import { relations } from 'drizzle-orm';
import { foreignKey, int, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { profiles } from './schema.profiles';

export const skills = sqliteTable(
  'skills',
  {
    profileId: int('profile_id', { mode: 'number' }).notNull(),
    skillId: text('skill_id').notNull(),
    xp: int('xp', { mode: 'number' }).notNull().default(0),
    level: int('level', { mode: 'number' }).notNull().default(0),
  },
  (table) => [
    primaryKey({ name: 'idx', columns: [table.profileId, table.skillId] }),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
    }),
  ],
);

export const skillRelations = relations(skills, ({ one }) => ({
  profile: one(profiles, {
    fields: [skills.profileId],
    references: [profiles.id],
  }),
}));
