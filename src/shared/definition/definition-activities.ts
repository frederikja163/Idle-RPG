export const activities = new Map<string, ActivityDef>();

mining('Talc', 5000, 1, 0);
mining('Gypsum', 5000, 2, 10);
mining('Calcite', 5000, 3, 20);
mining('Flourite', 5000, 4, 30);
mining('Apatite', 5000, 5, 40);

lumberjacking('Balsa', 5000, 1, 0);
lumberjacking('Pine', 5000, 2, 10);
lumberjacking('Cedar', 5000, 3, 20);
lumberjacking('Cherry', 5000, 4, 30);
lumberjacking('Oak', 5000, 5, 40);

function mining(name: string, time: number, xpAmount: number, levelRequirement: number) {
  const id = name.toLowerCase();
  gathering(`mine_ore_${id}`, `${name} ore`, 'mining', time, xpAmount, `ore_${id}`, levelRequirement);
}

function lumberjacking(name: string, time: number, xpAmount: number, levelRequirement: number) {
  const id = name.toLowerCase();
  gathering(`cut_log_${id}`, `${name} wood`, 'lumberjacking', time, xpAmount, `log_${id}`, levelRequirement);
}

function gathering(
  id: string,
  display: string,
  skill: string,
  time: number,
  xpAmount: number,
  resultId: string,
  levelRequirement: number,
) {
  activities.set(id, { type: 'gathering', id, skill, display, time, xpAmount, resultId, levelRequirement });
}

export type ActivityDef = GatheringActivityDef;

export type GatheringActivityDef = {
  type: 'gathering';
  id: ActivityId;
  skill: string;
  display: string;
  time: number;
  xpAmount: number;
  resultId: string;
  levelRequirement: number;
};

export type ActivityId = string;
