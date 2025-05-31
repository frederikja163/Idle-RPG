import { type ItemDef } from './definition-items';
import type { SkillDef } from './definition-skills';
import type { ItemId } from './schema/types/types-items';
import type { SkillId } from './schema/types/types-skills';

export type ActivityId = string;
export const activities = new Map<ActivityId, ActivityDef>();

export type ItemAmount = { itemId: ItemId; amount: number };
function itemAmount(itemId: ItemId, amount: number): ItemAmount {
  return { itemId, amount };
}

export type SkillRequirement = { skillId: SkillId; level: number };
function skillRequirement(skillId: SkillId, level: number): SkillRequirement {
  return { skillId, level: level };
}

export type GatheringActivityDef = {
  type: 'gathering';
  id: ActivityId;
  display: string;
  time: number;
  xpAmount: number;
  skillRequirement: SkillRequirement;
  result: ItemAmount;
};
function gatheringActivityDef(
  id: ActivityId,
  display: string,
  time: number,
  xpAmount: number,
  skillRequirement: SkillRequirement,
  result: ItemAmount,
) {
  activities.set(id, { type: 'gathering', id, display, time, xpAmount, skillRequirement, result });
}
export function gatheringDef(result: ItemDef, skill: SkillDef, activityName: string, tier: number) {
  gatheringActivityDef(
    `${activityName}${result.id}`,
    `${activityName} ${result.display}`,
    5000,
    tier + 1,
    skillRequirement(skill.id, tier * 10),
    itemAmount(result.id, 1),
  );
}

export type ProcessingActivityDef = {
  type: 'processing';
  id: ActivityId;
  display: string;
  time: number;
  xpAmount: number;
  skillRequirement: SkillRequirement;
  cost: ItemAmount;
  result: ItemAmount;
};
function processingActivityDef(
  id: ActivityId,
  display: string,
  time: number,
  xpAmount: number,
  skillRequirement: SkillRequirement,
  cost: ItemAmount,
  result: ItemAmount,
) {
  activities.set(id, { type: 'processing', id, display, time, xpAmount, skillRequirement, cost, result });
}
export function processingDef(cost: ItemDef, result: ItemDef, skill: SkillDef, activityName: string, tier: number) {
  processingActivityDef(
    `${activityName}${cost.id}`,
    `${activityName} ${cost.display}`,
    5000,
    tier + 1,
    skillRequirement(skill.id, tier * 10),
    itemAmount(cost.id, 1),
    itemAmount(result.id, 1),
  );
}

export type CraftingActivityDef = {
  type: 'crafting';
  id: ActivityId;
  display: string;
  time: number;
  skillRequirements: SkillRequirement[];
  cost: ItemAmount[];
  result: (ItemAmount & { maxItems?: number })[];
};
function craftingActivityDef(
  id: ActivityId,
  display: string,
  time: number,
  skillRequirements: SkillRequirement[],
  cost: ItemAmount[],
  result: (ItemAmount & { maxItems?: number })[],
) {
  activities.set(id, { type: 'crafting', id, display, time, skillRequirements, cost, result });
}
export function craftingToolDef(cost: ItemDef, result: ItemDef, skill: SkillDef, tier: number) {
  craftingActivityDef(
    `Craft${result.id}`,
    `Craft ${result.display}`,
    1000 * Math.pow(2, tier + 1),
    [skillRequirement(skill.id, tier * 10)],
    [itemAmount(cost.id, 1)],
    [{ maxItems: 1, ...itemAmount(result.id, 1) }],
  );
}

export type ActivityDef = GatheringActivityDef | ProcessingActivityDef | CraftingActivityDef;
