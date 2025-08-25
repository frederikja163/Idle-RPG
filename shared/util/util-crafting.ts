import { craftingRecipes, type CraftingRecipeId } from '../definition/definition-crafting';
import type { Item, ItemId } from '../definition/schema/types/types-items';
import type { Skill, SkillId } from '../definition/schema/types/types-skills';
import { addItems, subItems } from './util-items';
import { addXp } from './util-skills';
import { ErrorType } from '@/shared/socket/socket-errors.ts';

export interface ProfileInterface {
  getItem(itemId: ItemId): Item | Promise<Item>;

  getSkill(skillId: SkillId): Skill | Promise<Skill>;
}

export function getActionCount(activityStart: Date, activityTime: number, activityEnd: Date) {
  const start = activityStart.getTime();
  const time = activityEnd.getTime();
  return Math.abs(start - time) / activityTime;
}

export async function canStartCrafting(
  recipeId: CraftingRecipeId,
  profileInterface: ProfileInterface,
): Promise<ErrorType | undefined> {
  const recipe = craftingRecipes.get(recipeId);
  if (!recipe) return ErrorType.InvalidInput;
  const skills = await Promise.all(
    recipe.skillRequirements.map(async (skill) => await profileInterface.getSkill(skill.skillId)),
  );
  const cost = await Promise.all(recipe.cost.map(async (item) => await profileInterface.getItem(item.itemId)));

  if (recipe.skillRequirements.find((req, i) => skills[i].level < req.level)) return ErrorType.InsufficientLevel;
  if (recipe.cost.find((req, i) => cost[i].count < req.amount)) return ErrorType.InsufficientLevel;
}

export async function processCrafting(
  activityStart: Date,
  activityEnd: Date,
  recipeId: CraftingRecipeId,
  profileInterface: ProfileInterface,
): Promise<{ items: Item[]; skills: Skill[] }> {
  const recipe = craftingRecipes.get(recipeId);
  if (!recipe) return { items: [], skills: [] };

  const skills = await Promise.all(
    recipe.skillRequirements.map(async (skill) => await profileInterface.getSkill(skill.skillId)),
  );
  const cost = await Promise.all(recipe.cost.map(async (item) => await profileInterface.getItem(item.itemId)));
  const result = await Promise.all(recipe.result.map(async (item) => await profileInterface.getItem(item.itemId)));

  const timeActions = Math.floor(getActionCount(activityStart, recipe.time, activityEnd));
  const costActions = recipe.cost.map((item, i) => cost[i].count / item.amount).reduce((l, r) => Math.min(l, r));
  const actionCount = Math.min(timeActions, costActions);

  recipe.skillRequirements.forEach((req, i) => addXp(skills[i], actionCount * req.xp));
  recipe.cost.forEach((item, i) => subItems(cost[i], actionCount * item.amount));
  recipe.result.forEach((item, i) => addItems(result[i], actionCount * item.amount));

  return { items: [...cost, ...result], skills };
}
