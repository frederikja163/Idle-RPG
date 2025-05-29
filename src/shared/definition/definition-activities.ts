import type { ItemId } from './schema/types/types-items';
import type { SkillId } from './schema/types/types-skills';

export type ActivityId = string;
export const activities = new Map<ActivityId, ActivityDef>();

mine('talc', 0);
mine('gypsum', 1);
mine('calcite', 2);
mine('flourite', 3);
mine('apatite', 4);

refine('talc', 0);
refine('gypsum', 1);
refine('calcite', 2);
refine('flourite', 3);
refine('apatite', 4);

cut('balsa', 0);
cut('pine', 1);
cut('cedar', 2);
cut('cherry', 3);
cut('oak', 4);

carve('balsa', 0);
carve('pine', 1);
carve('cedar', 2);
carve('cherry', 3);
carve('oak', 4);

function mine(name: string, tier: number) {
  const id = `mine_ore_${name}`;
  activities.set(
    id,
    gatheringActivityDef(
      id,
      `Mine ${name} ore`,
      5000,
      tier + 1,
      skillRequirement('mining', tier * 10),
      itemAmount(`ore_${name}`, 1),
    ),
  );
}
function refine(name: string, tier: number) {
  const id = `refine_ore_${name}`;
  activities.set(
    id,
    processingActivityDef(
      id,
      `Refine ${name} ore`,
      5000,
      tier + 1,
      skillRequirement('refining', tier * 10),
      itemAmount(`ore_${name}`, 1),
      itemAmount(`refined_${name}`, 1),
    ),
  );
}
function cut(name: string, tier: number) {
  const id = `cut_log_${name}`;
  activities.set(
    id,
    gatheringActivityDef(
      id,
      `Cut ${name} log`,
      5000,
      tier + 1,
      skillRequirement('lumberjacking', tier * 10),
      itemAmount(`log_${name}`, 1),
    ),
  );
}
function carve(name: string, tier: number) {
  const id = `carve_log_${name}`;
  activities.set(
    id,
    processingActivityDef(
      id,
      `Carve ${name} log`,
      5000,
      tier + 1,
      skillRequirement('carpentry', tier * 10),
      itemAmount(`log_${name}`, 1),
      itemAmount(`plank_${name}`, 1),
    ),
  );
}

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
): GatheringActivityDef {
  return { type: 'gathering', id, display, time, xpAmount, skillRequirement, result };
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
): ProcessingActivityDef {
  return { type: 'processing', id, display, time, xpAmount, skillRequirement, cost, result };
}

export type CraftingActivityDef = {
  type: 'crafting';
  id: ActivityId;
  display: string;
  time: number;
  skillRequirements: SkillRequirement[];
  cost: ItemAmount[];
  result: ItemAmount & { maxItems?: number }[];
};
function _craftingActivityDef(
  id: ActivityId,
  display: string,
  time: number,
  skillRequirements: SkillRequirement[],
  cost: ItemAmount[],
  result: ItemAmount & { maxItems?: number }[],
): CraftingActivityDef {
  return { type: 'crafting', id, display, time, skillRequirements, cost, result };
}

export type ActivityDef = GatheringActivityDef | ProcessingActivityDef | CraftingActivityDef;
