export const activity = new Map<string, Activity>();

function addActivity(id: string, skill: string, display: string) {
  return {
    id,
    skill,
    display,
  };
}

export type Activity = {
  id: string;
  skill: string;
  display: string;
};
