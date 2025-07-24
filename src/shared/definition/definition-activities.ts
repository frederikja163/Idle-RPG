import { type ItemDef } from './definition-items';
import type { SkillDef } from './definition-skills';
import type { EquipmentSlot, SkillStatBlock } from './definitions-equipment';
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
export type SkillXp = SkillRequirement & { xp: number };
function skillXp(skillId: SkillId, level: number, xp: number): SkillXp {
  return { skillId, level, xp };
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
    `${activityName}${result.id}`,
    `${activityName} ${result.display}`,
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
  skills: SkillXp[];
  cost: ItemAmount[];
  result: ItemAmount[];
};
function craftingActivityDef(
  id: ActivityId,
  display: string,
  time: number,
  skills: SkillXp[],
  cost: ItemAmount[],
  result: ItemAmount[],
) {
  activities.set(id, { type: 'crafting', id, display, time, skills, cost, result });
}

export type EquipActivityDef = {
  type: 'Equip';
  id: ActivityId;
  display: string;
  time: number;
  skills: SkillXp[];
  item: ItemId;
  slot: EquipmentSlot;
  stats: SkillStatBlock;
};
function equipActivityDef(
  id: ActivityId,
  display: string,
  time: number,
  skills: SkillXp[],
  item: ItemId,
  slot: EquipmentSlot,
  stats: SkillStatBlock,
) {
  activities.set(id, { type: 'Equip', id, display, time, skills, item, slot, stats });
}
export function equipToolDef(
  crafting: SkillDef,
  skill: SkillDef,
  item: ItemDef,
  slot: EquipmentSlot,
  stats: SkillStatBlock,
  tier: number,
) {
  equipActivityDef(
    `Equip${item.id}${slot}`,
    `Equip ${item.display} to ${slot}`,
    10000,
    [skillXp(crafting.id, 0, tier * 1000), skillXp(skill.id, tier * 10, 0)],
    item.id,
    slot,
    stats,
  );
}

export type ActivityDef = GatheringActivityDef | ProcessingActivityDef | CraftingActivityDef | EquipActivityDef;
export const NoActivity = 'None';
