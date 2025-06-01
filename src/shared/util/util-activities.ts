import type { ActivityDef, GatheringActivityDef, ProcessingActivityDef } from '../definition/definition-activities';
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

  const actionCount = Math.min(
    Math.floor(getActionCount(activityStart, activity.time, activityEnd) / activity.cost.amount),
    costItem.count,
  );

  subItems(costItem, actionCount * activity.cost.amount);
  addItems(resultItem, actionCount * activity.result.amount);

  addXp(skill, actionCount * activity.xpAmount);

  return { items: [costItem, resultItem], skills: [skill] };
}
