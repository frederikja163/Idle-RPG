export const skills = new Map<string, Skill>();

function addSkill(id: string, display: string){
  return {id, display};
}

export type Skill = {
  id: string,
  display: string,
};