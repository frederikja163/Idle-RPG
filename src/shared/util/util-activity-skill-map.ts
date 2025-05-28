import { activities, type ActivityDef, type ActivityId } from '@/shared/definition/definition-activities';
import { skills } from '@/shared/definition/definition-skills';
import type { SkillId } from '../definition/schema/types/types-skills';

export const activitySkillMap = new Map<SkillId, ActivityId[]>();

skills.entries().forEach(([id]) => addActivitiesForSkill(id));

export function getActivitySkill(activity: ActivityDef): SkillId | undefined {
  switch (activity.type) {
    case 'gathering':
    case 'processing':
      return activity.skillRequirement.skillId;
    default:
      return;
  }
}

function addActivitiesForSkill(skill: SkillId) {
  const activitiesForSkill = activities
    .entries()
    .filter(([_, act]) => getActivitySkill(act) === skill)
    .map(([_, act]) => act.id)
    .toArray();

  activitySkillMap.set(skill, activitiesForSkill);
}
