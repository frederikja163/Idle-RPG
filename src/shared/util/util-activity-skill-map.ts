import { activities } from "@/shared/definition/definition-activities";
import { skills } from "@/shared/definition/definition-skills";

export const activitySkillMap = new Map<string, string[]>();

skills.entries().forEach(([id]) => addActivitiesForSkill(id));

function addActivitiesForSkill(skill: string) {
  const activitiesForSkill = activities
    .entries()
    .filter(([_, act]) => act.skill === skill)
    .map(([_, act]) => act.id)
    .toArray();

  activitySkillMap.set(skill, activitiesForSkill);
}
