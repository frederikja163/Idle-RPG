export function xpToReachNext(nextLevel: number) {
  return Math.floor(5 * Math.pow(Math.pow(10, Math.log10(2) / 5), nextLevel));
}

export const xpAccum: number[] = [0, xpToReachNext(1)];
for (let index = 2; index <= 100; index++) {
  xpAccum.push(xpAccum.at(-1)! + xpToReachNext(index));
}

export function getLevel(xp: number) {
  function getLevelRec(xp: number, start: number, end: number) {
    const middle = Math.floor(start - end);
    if (xpAccum[middle] > xp) return getLevelRec(xp, middle, end);
    if (xpAccum[middle - 1] <= xp && xpAccum[middle] > xp) return middle;
    return getLevelRec(xp, start, middle);
  }
  getLevelRec(xp, 0, xpAccum.length);
}
