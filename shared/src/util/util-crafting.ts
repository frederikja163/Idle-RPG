import { CraftingRecipeDef, type CraftingRecipeId } from '../definition/definition-crafting';
import type { Item, ItemId } from '../definition/schema/types/types-items';
import type { Skill, SkillId } from '../definition/schema/types/types-skills';
import { addItems, subItems } from './util-items';
import { addXp } from './util-skills';
import { ErrorType } from '@/shared/socket/socket-errors';

export interface ProfileInterface {
  getItem(itemId: ItemId): Item | Promise<Item>;

  getSkill(skillId: SkillId): Skill | Promise<Skill>;
}

export function getActionCount(activityStart: number, activityTime: number, activityEnd: number) {
  return Math.abs(activityStart - activityEnd) / activityTime;
}

export async function canStartCrafting(
  recipeId: CraftingRecipeId,
  profileInterface: ProfileInterface,
): Promise<ErrorType | undefined> {
  const recipe = CraftingRecipeDef.getById(recipeId);
  if (!recipe) return ErrorType.InvalidInput;
  const skills = await Promise.all(
    await recipe.getSkillRequirements().map(async (skill) => await profileInterface.getSkill(skill.skill.id)),
  );
  const costs = await Promise.all(recipe.getCosts().map(async (item) => await profileInterface.getItem(item.item.id)));

  if (recipe.getSkillRequirements().find((req, i) => skills[i].level < req.level)) return ErrorType.InsufficientLevel;
  if (recipe.getCosts().find((cost, i) => costs[i].count < cost.amount)) return ErrorType.InsufficientLevel;
}

export async function processCrafting(
  activityStart: number,
  activityEnd: number,
  recipeId: CraftingRecipeId,
  profileInterface: ProfileInterface,
): Promise<{ items: Item[]; skills: Skill[] }> {
  const recipe = CraftingRecipeDef.getById(recipeId);
  if (!recipe) return { items: [], skills: [] };

  const skills = await Promise.all(
    recipe.getSkillRequirements().map(async (req) => await profileInterface.getSkill(req.skill.id)),
  );
  const cost = await Promise.all(recipe.getCosts().map(async (item) => await profileInterface.getItem(item.item.id)));
  const result = await Promise.all(
    recipe.getResults().map(async (item) => await profileInterface.getItem(item.item.id)),
  );

  const timeActions = Math.floor(getActionCount(activityStart, recipe.time, activityEnd));
  const costActions = recipe.getCosts().some(() => true)
    ? recipe
        .getCosts()
        .map((item, i) => cost[i].count / item.amount)
        .reduce((l, r) => Math.min(l, r))
    : Number.POSITIVE_INFINITY;
  const actionCount = Math.min(timeActions, costActions);

  recipe.getSkillRequirements().forEach((req, i) => addXp(skills[i], actionCount * req.xp));
  recipe.getCosts().forEach((item, i) => subItems(cost[i], actionCount * item.amount));
  recipe.getResults().forEach((item, i) => addItems(result[i], actionCount * item.amount));

  return { items: [...cost, ...result], skills };
}
