import type {
  ActivityDef,
  CraftingActivityDef,
  GatheringActivityDef,
  ProcessingActivityDef,
} from '../definition/definition-activities';
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

export async function canStartActivity(
  activity: ActivityDef,
  profileInterface: ProfileInterface,
): Promise<ErrorType | undefined> {
  switch (activity.type) {
    case 'gathering':
      return await canStartGatheringActivity(activity, profileInterface);
    case 'processing':
      return await canStartProcessingActivity(activity, profileInterface);
    case 'crafting':
      return await canStartCraftingActivity(activity, profileInterface);
    default:
      return ErrorType.InternalError;
  }
}

export async function processActivity(
  activityStart: Date,
  activityEnd: Date,
  activity: ActivityDef,
  profileInterface: ProfileInterface,
): Promise<{ items: Item[]; skills: Skill[] }> {
  switch (activity.type) {
    case 'gathering':
      return await processGatheringActivity(activityStart, activityEnd, activity, profileInterface);
    case 'processing':
      return await processProcessingActivity(activityStart, activityEnd, activity, profileInterface);
    case 'crafting':
      return await processCraftingActivity(activityStart, activityEnd, activity, profileInterface);
    default:
      return { items: [], skills: [] };
  }
}

async function canStartGatheringActivity(activity: GatheringActivityDef, profileInterface: ProfileInterface) {
  const skill = await profileInterface.getSkill(activity.skillRequirement.skillId);

  if (skill.level < activity.skillRequirement.level) return ErrorType.InsufficientLevel;
}

export async function processGatheringActivity(
  activityStart: Date,
  activityEnd: Date,
  activity: GatheringActivityDef,
  profileInterface: ProfileInterface,
) {
  const skill = await profileInterface.getSkill(activity.skillRequirement.skillId);
  const item = await profileInterface.getItem(activity.result.itemId);
  const actionCount = Math.floor(getActionCount(activityStart, activity.time, activityEnd));

  addXp(skill, actionCount * activity.result.amount * activity.xpAmount);

  addItems(item, actionCount);

  return { items: [item], skills: [skill] };
}

async function canStartProcessingActivity(activity: ProcessingActivityDef, profileInterface: ProfileInterface) {
  const costItem = await profileInterface.getItem(activity.cost.itemId);
  const skill = await profileInterface.getSkill(activity.skillRequirement.skillId);

  if (skill.level < activity.skillRequirement.level) return ErrorType.InsufficientLevel;
  if (costItem.count < activity.cost.amount) return ErrorType.InsufficientItems;
}

export async function processProcessingActivity(
  activityStart: Date,
  activityEnd: Date,
  activity: ProcessingActivityDef,
  profileInterface: ProfileInterface,
) {
  const costItem = await profileInterface.getItem(activity.cost.itemId);
  const resultItem = await profileInterface.getItem(activity.result.itemId);
  const skill = await profileInterface.getSkill(activity.skillRequirement.skillId);
  const actions = Math.floor(getActionCount(activityStart, activity.time, activityEnd));

  const actionCount = Math.min(actions, costItem.count / activity.cost.amount);

  subItems(costItem, actionCount * activity.cost.amount);
  addItems(resultItem, actionCount * activity.result.amount);

  addXp(skill, actionCount * activity.xpAmount);

  return { items: [costItem, resultItem], skills: [skill] };
}

async function canStartCraftingActivity(activity: CraftingActivityDef, profileInterface: ProfileInterface) {
  const skills = await Promise.all(activity.skillRequirements.map((skill) => profileInterface.getSkill(skill.skillId)));
  const cost = await Promise.all(activity.cost.map((c) => profileInterface.getItem(c.itemId)));

  if (activity.skillRequirements.find((s, i) => skills[i].level < s.level)) return ErrorType.InsufficientLevel;
  if (activity.cost.find((c, i) => cost[i].count < c.amount)) return ErrorType.InsufficientLevel;
}

async function processCraftingActivity(
  activityStart: Date,
  activityEnd: Date,
  activity: CraftingActivityDef,
  profileInterface: ProfileInterface,
) {
  const costItems = await Promise.all(activity.cost.map((i) => profileInterface.getItem(i.itemId)));
  const resultItems = await Promise.all(activity.result.map((i) => profileInterface.getItem(i.itemId)));
  const actions = Math.floor(getActionCount(activityStart, activity.time, activityEnd));

  const maxActionCount = activity.cost.map((c, i) => costItems[i].count / c.amount).reduce((l, r) => Math.min(l, r));

  const actionCount = Math.min(actions, maxActionCount);

  activity.cost.forEach((c, i) => subItems(costItems[i], actionCount * c.amount));
  activity.result.forEach((c, i) => addItems(resultItems[i], actionCount * c.amount));

  return { items: [...costItems, ...resultItems], skills: [] };
}
