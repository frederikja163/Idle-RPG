import type { Skill } from '../definition/schema/types/types-skills';

export function xpToReachNext(nextLevel: number) {
  return Math.floor(5 * Math.pow(Math.pow(10, Math.log10(2) / 5), nextLevel));
}

export const xpAccum: number[] = [0, xpToReachNext(1)];
for (let index = 2; index <= 100; index++) {
  xpAccum.push(xpAccum.at(-1)! + xpToReachNext(index));
}

export function addXp(skill: Skill, xp: number) {
  skill.xp += xp;
  while (skill.xp > xpAccum[skill.level]) {
    skill.level += 1;
  }
}
