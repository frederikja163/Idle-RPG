import { type GatheringActivity } from '../definition/definition.activities';

export function getGatheringActions(activity: GatheringActivity, start: Date) {
  const now = new Date();
  const duration = now.getTime() - start.getTime();
  return duration / activity.time;
}
