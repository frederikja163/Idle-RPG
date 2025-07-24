export enum EquipmentSlot {
  MiningHead = 'Pickaxe head',
  MiningHandle = 'Pickaxe handle',
  LumberjackingHead = 'Axe head',
  LumberjackingHandle = 'Axe handle',
  CraftingHead = 'Hammer head',
  CraftingHandle = 'Hammer handle',
}

export type SkillStatBlock = {
  Speed?: number;
  Productivity?: number;
  Xp?: number;
  CraftingXp?: number;
};
