import { activities } from '@/shared/definition/definition.activities';
import { skills } from '@/shared/definition/definition.skills.ts';

export const activitySkillMap = new Map<string, string[]>();

skills.entries().forEach(([id]) => addActivitiesForSkill(id));

function addActivitiesForSkill(skill: string) {
  const activities = activities
    .entries()
    .filter(([id, act]) => act.skill === skill)
    .map(([id, act]) => act.id)
    .toArray();

  activitySkillMap.set(skill, activities);
}
