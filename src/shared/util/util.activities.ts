export function getActionCount(activityStart: Date, activityTime: number) {
  const start = activityStart.getTime();
  const time = new Date().getTime();
  return Math.floor(Math.abs(start - time) / activityTime);
}
