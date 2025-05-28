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
  const skill = await profileInterface.getSkill(activity.skill);
  const item = await profileInterface.getItem(activity.resultId);
  const actionCount = Math.floor(getActionCount(activityStart, activity.time, activityEnd));

  addXp(skill, actionCount * activity.xpAmount);

  addItems(item, actionCount);

  if (!profileInterface.setItem || !profileInterface.setSkill) return;

  profileInterface.setItem(item);
  profileInterface.setSkill(skill);
}

export async function processProcessingActivity(
  activityStart: Date,
  activityEnd: Date,
  activity: ProcessingActivityDef,
  profileInterface: ProfileInterface,
) {
  const costItem = await profileInterface.getItem(activity.costId);
  const resultItem = await profileInterface.getItem(activity.resultId);
  const skill = await profileInterface.getSkill(activity.skill);

  const actionCount = Math.min(Math.floor(getActionCount(activityStart, activity.time, activityEnd)), costItem.count);

  subItems(costItem, actionCount);
  addItems(resultItem, actionCount);

  addXp(skill, actionCount * activity.xpAmount);

  if (!profileInterface.setItem || !profileInterface.setSkill) return;

  profileInterface.setItem(costItem);
  profileInterface.setItem(resultItem);
  profileInterface.setSkill(skill);
}

export interface ProfileInterface {
  getItem(itemId: ItemId): Item | Promise<Item>;

  getSkill(skillId: SkillId): Skill | Promise<Skill>;

  setItem?(item: Item): void;

  setSkill?(skill: Skill): void;
}
