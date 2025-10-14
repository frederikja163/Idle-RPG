import type { skillsTable } from '../db/db-skills';

export type Skill = typeof skillsTable.$inferSelect;
export type SkillId = string;
