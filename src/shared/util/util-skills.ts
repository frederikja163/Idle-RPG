import type { Skill } from '../definition/schema/types/types-skills';

const maxLevel = 50;

export function xpToReachNext(nextLevel: number) {
  return Math.floor(25 * Math.pow(2, nextLevel / 5));
}

export const xpAccum: number[] = [0, xpToReachNext(1)];
for (let index = 2; index <= maxLevel; index++) {
  xpAccum.push(xpAccum.at(-1)! + xpToReachNext(index));
}

export function addXp(skill: Skill, xp: number) {
  skill.xp += xp;
  while (skill.xp >= xpAccum[skill.level + 1]) {
    skill.level += 1;
  }
  if (skill.level >= maxLevel) {
    skill.xp = xpAccum[maxLevel];
  }
}
