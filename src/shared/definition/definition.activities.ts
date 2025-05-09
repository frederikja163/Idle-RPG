export const activity = new Map<string, Activity>();

mining('Talc', 5000, 1);
mining('Gypsum', 5000, 2);
mining('Calcite', 5000, 3);
mining('Flourite', 5000, 4);
mining('Apatite', 5000, 5);

lumberjacking('Balsa', 5000, 1);
lumberjacking('Pine', 5000, 2);
lumberjacking('Cedar', 5000, 3);
lumberjacking('Cherry', 5000, 4);
lumberjacking('Oak', 5000, 5);

function mining(name: string, time: number, xpAmount: number) {
  const id = name.toLowerCase();
  gathering(`mine_ore_${id}`, `${name} ore`, 'mining', time, xpAmount, `ore_${id}`);
}

function lumberjacking(name: string, time: number, xpAmount: number) {
  const id = name.toLowerCase();
  gathering(`cut_log_${id}`, `${name} wood`, 'lumberjacking', time, xpAmount, `log_${id}`);
}

function gathering(id: string, display: string, skill: string, time: number, xpAmount: number, resultId: string) {
  activity.set(id, { type: 'gathering', id, skill, display, time, xpAmount, resultId });
}

export type Activity = GatheringActivity;

export type GatheringActivity = {
  type: 'gathering';
  id: string;
  skill: string;
  display: string;
  time: number;
  xpAmount: number;
  resultId: string;
};
