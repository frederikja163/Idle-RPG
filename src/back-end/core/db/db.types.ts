import type { InferSelectModel } from 'drizzle-orm';
import type { profiles } from './schema/schema-profiles';
import type { users } from './schema/schema-users';
import type { items } from './schema/schema-items';
import type { skills } from './schema/schema-skills';

export type UserType = InferSelectModel<typeof users>;
export type UserId = string;
export type ProfileType = InferSelectModel<typeof profiles>;
export type ProfileId = string;
export type ItemType = InferSelectModel<typeof items>;
export type SkillType = InferSelectModel<typeof skills>;
export type OmitAutoFields<T> = Omit<T, 'id' | 'firstLogin' | 'lastLogin'>;
