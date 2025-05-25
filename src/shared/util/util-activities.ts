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
  profileUpdater: ProfileUpdater,
) {
  const actionCount = Math.floor(getActionCount(activityStart, activity.time, activityEnd));

  const skill = await profileUpdater.getSkill(activity.skill);
  addXp(skill, actionCount * activity.xpAmount);

  const item = await profileUpdater.getItem(activity.resultId);
  addItems(item, actionCount);

  profileUpdater.save();
}

export async function processProcessingActivity(
  activityStart: Date,
  activityEnd: Date,
  activity: ProcessingActivityDef,
  profileUpdater: ProfileUpdater,
) {
  const item = await profileUpdater.getItem(activity.costId);

  const actionCount = Math.min(Math.floor(getActionCount(activityStart, activity.time, activityEnd)), item.count);

  subItems(item, actionCount);

  const skill = await profileUpdater.getSkill(activity.skill);
  addXp(skill, actionCount * activity.xpAmount);

  profileUpdater.save();
}

export interface ProfileUpdater {
  getItem(itemId: ItemId): Item | Promise<Item>;
  getSkill(skillId: SkillId): Skill | Promise<Skill>;
  save(): void;
}
