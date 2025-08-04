import { type CraftingRecipeDef } from './definition-crafting';
import type { SkillId } from './schema/types/types-skills';

export const skills = new Map<string, SkillDef>();

export function skillDef(name: string) {
  const skill = { id: name, display: name, craftingRecipes: [] };
  skills.set(name, skill);
  return skill;
}

export type SkillDef = {
  id: SkillId;
  display: string;
  craftingRecipes: CraftingRecipeDef[];
};
