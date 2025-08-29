import { type ItemDef } from './definition-items';
import type { SkillDef } from './definition-skills';
import type { ItemId } from './schema/types/types-items';
import type { SkillId } from './schema/types/types-skills';

export type CraftingRecipeId = string;
export const craftingRecipes = new Map<CraftingRecipeId, CraftingRecipeDef>();

export type ItemAmount = { itemId: ItemId; amount: number };
function itemAmount(itemId: ItemId, amount: number): ItemAmount {
  return { itemId, amount };
}

export type SkillRequirement = { skillId: SkillId; level: number; xp: number };
function skillRequirement(skillId: SkillId, level: number, xp: number = 0): SkillRequirement {
  return { skillId, level: level, xp };
}

export type CraftingRecipeDef = {
  type: 'crafting';
  id: CraftingRecipeId;
  display: string;
  time: number;
  skillRequirements: SkillRequirement[];
  cost: ItemAmount[];
  result: ItemAmount[];
};
function craftingActivityDef(
  id: CraftingRecipeId,
  display: string,
  time: number,
  skillRequirements: SkillRequirement[],
  cost: ItemAmount[],
  result: ItemAmount[],
) {
  const recipe: CraftingRecipeDef = { type: 'crafting', id, display, time, skillRequirements, cost, result };
  craftingRecipes.set(id, recipe);
  return recipe;
}
export function gatheringDef(result: ItemDef, skill: SkillDef, activityName: string, tier: number) {
  const recipe = craftingActivityDef(
    `${result.id}`,
    `${activityName} ${result.display}`,
    5000,
    [skillRequirement(skill.id, tier * 10, tier + 1)],
    [],
    [itemAmount(result.id, 1)],
  );
  skill.craftingRecipes.push(recipe);
}
export function processingDef(cost: ItemDef, result: ItemDef, skill: SkillDef, activityName: string, tier: number) {
  const recipe = craftingActivityDef(
    `${result.id}`,
    `${activityName} ${result.display}`,
    5000,
    [skillRequirement(skill.id, tier * 10, tier + 1)],
    [itemAmount(cost.id, 1)],
    [itemAmount(result.id, 1)],
  );
  skill.craftingRecipes.push(recipe);
}
