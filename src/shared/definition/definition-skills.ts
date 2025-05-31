import type { SkillId } from './schema/types/types-skills';

export const skills = new Map<string, SkillDef>();

export function skillDef(name: string) {
  const skill = { id: name, display: name };
  skills.set(name, skill);
  return skill;
}

export type SkillDef = {
  id: SkillId;
  display: string;
};
