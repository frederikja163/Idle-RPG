import type { ItemId } from './schema/types/types-items';
import type { SkillId } from './schema/types/types-skills';

export const activities = new Map<string, ActivityDef>();

ore('Talc', 0);
ore('Gypsum', 1);
ore('Calcite', 2);
ore('Flourite', 3);
ore('Apatite', 4);

log('Balsa', 0);
log('Pine', 1);
log('Cedar', 2);
log('Cherry', 3);
log('Oak', 4);

function ore(name: string, tier: number) {
  const id = name.toLowerCase();
  gathering(`mine_ore_${id}`, 'mining', `${name} ore`, 5000, tier + 1, `ore_${id}`, tier * 10);
  processing(`smith_ore_${id}`, 'smithing', `${name} ore`, 5000, tier + 1, `ore_${id}`, tier * 10);
}

function log(name: string, tier: number) {
  const id = name.toLowerCase();
  gathering(`cut_log_${id}`, 'lumberjacking', `${name} log`, 5000, tier + 1, `log_${id}`, tier * 10);
  processing(`carve_log_${id}`, 'carpentry', `${name} log`, 5000, tier + 1, `log_${id}`, tier * 10);
}

function gathering(
  id: ActivityId,
  skill: SkillId,
  display: string,
  time: number,
  xpAmount: number,
  resultId: string,
  levelRequirement: number,
) {
  activities.set(id, { type: 'gathering', id, skill, display, time, xpAmount, resultId, levelRequirement });
}

function processing(
  id: ActivityId,
  skill: SkillId,
  display: string,
  time: number,
  xpAmount: number,
  costId: ItemId,
  levelRequirement: number,
) {
  activities.set(id, { type: 'processing', id, skill, display, time, xpAmount, costId, levelRequirement });
}

export type ActivityDef = GatheringActivityDef | ProcessingActivityDef;

export type GatheringActivityDef = {
  type: 'gathering';
  id: ActivityId;
  skill: SkillId;
  display: string;
  time: number;
  xpAmount: number;
  resultId: string;
  levelRequirement: number;
};

export type ProcessingActivityDef = {
  type: 'processing';
  id: ActivityId;
  skill: SkillId;
  display: string;
  time: number;
  xpAmount: number;
  costId: string;
  levelRequirement: number;
};

export type ActivityId = string;
