import type { GatheringActivityDef, ProcessingActivityDef } from '../definition/definition-activities';
import type { Item, ItemId } from '../definition/schema/types/types-items';
import type { Skill, SkillId } from '../definition/schema/types/types-skills';
import { addItems, subItems } from './util-items';
import { addXp } from './util-skills';

export function getActionCount(activityStart: Date, activityTime: number, activityEnd: Date) {
  const start = activityStart.getTime();
  const time = activityEnd.getTime();
  return Math.abs(start - time) / activityTime;
}

export async function proccessGatheringActivity(
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
}

export interface ProfileInterface {
  getItem(itemId: ItemId): Item | Promise<Item>;
  getSkill(skillId: SkillId): Skill | Promise<Skill>;
}
