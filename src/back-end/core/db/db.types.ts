import type { InferSelectModel } from 'drizzle-orm';
import type { profilesTable } from './schema/schema-profiles';
import type { usersTable } from './schema/schema-users';
import type { itemsTable } from './schema/schema-items';
import type { skillsTable } from './schema/schema-skills';

export type UserType = InferSelectModel<typeof usersTable>;
export type UserId = string;
export type ProfileType = InferSelectModel<typeof profilesTable>;
export type ProfileId = string;
export type ItemType = InferSelectModel<typeof itemsTable>;
export type SkillType = InferSelectModel<typeof skillsTable>;
export type OmitAutoFields<T> = Omit<T, 'id' | 'firstLogin' | 'lastLogin'>;
