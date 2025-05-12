import type { SkillId } from './schema/types/types-skills';

export const skills = new Map<string, SkillDef>();

addSkill('mining', 'Mining');
addSkill('smithing', 'Smithing');
addSkill('lumberjacking', 'Lumberjacking');
addSkill('carpentry', 'Carpentry');

function addSkill(id: SkillId, display: string) {
  skills.set(id, { id, display });
}

export type SkillDef = {
  id: SkillId;
  display: string;
};
