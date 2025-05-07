export function xpToReachNext(nextLevel: number) {
  return Math.floor(5 * Math.pow(Math.pow(10, Math.log10(2) / 5), nextLevel));
}

export const xpAccum: number[] = [0, xpToReachNext(1)];
for (let index = 2; index <= 100; index++) {
  xpAccum.push(xpAccum.at(-1)! + xpToReachNext(index));
}
