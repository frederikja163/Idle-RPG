export function getActionCount(activityStart: Date, activityTime: number, now: Date) {
  const start = activityStart.getTime();
  const time = now.getTime();
  return Math.abs(start - time) / activityTime;
}
