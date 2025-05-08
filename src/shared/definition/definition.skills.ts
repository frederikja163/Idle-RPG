export const skills = new Map<string, Skill>();

addSkill('mining', 'Mining');
addSkill('smithing', 'Smithing');
addSkill('lumberjacking', 'Lumberjacking');
addSkill('carpentry', 'Carpentry');

function addSkill(id: SkillId, display: string) {
  skills.set(id, { id, display });
}

export type Skill = {
  id: SkillId;
  display: string;
};

export type SkillId = string;
