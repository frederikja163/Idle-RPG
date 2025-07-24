import { equipToolDef, gatheringDef, processingDef } from './definition-activities';
import { itemDef, ItemTag } from './definition-items';
import { skillDef } from './definition-skills';
import { EquipmentSlot, type SkillStatBlock } from './definitions-equipment';

const mining = skillDef('Mining');
const lumberjacking = skillDef('Lumberjacking');
const crafting = skillDef('Crafting');

ore('Talc', 0);
ore('Gypsum', 1);
ore('Calcite', 2);
ore('Flourite', 3);
ore('Apatite', 4);

wood('Balsa', 0);
wood('Pine', 1);
wood('Cedar', 2);
wood('Cherry', 3);
wood('Oak', 4);

function ore(name: string, tier: number) {
  const statBlock: SkillStatBlock = {
    Productivity: tier / 10,
    CraftingXp: tier / 10,
  };
  const ore = itemDef(`Ore${name}`, `${name} Ore`, [ItemTag.Resource]);
  gatheringDef(ore, mining, 'Mine', tier);
  const pickaxe = itemDef(`HeadPickaxe${name}`, `${name} Pickaxe Head`, [ItemTag.Tool]);
  processingDef(ore, pickaxe, crafting, 'Craft', tier);
  equipToolDef(crafting, mining, pickaxe, EquipmentSlot.MiningHead, statBlock, tier);
  const axe = itemDef(`HeadAxe${name}`, `${name} Axe Head`, [ItemTag.Tool]);
  processingDef(ore, axe, crafting, 'Craft', tier);
  equipToolDef(crafting, lumberjacking, axe, EquipmentSlot.LumberjackingHead, statBlock, tier);
  const hammer = itemDef(`HeadHammer${name}`, `${name} Hammer Head`, [ItemTag.Tool]);
  processingDef(ore, hammer, crafting, 'Craft', tier);
  equipToolDef(crafting, crafting, hammer, EquipmentSlot.CraftingHead, statBlock, tier);
}

function wood(name: string, tier: number) {
  const statBlock: SkillStatBlock = {
    Speed: tier / 10,
    CraftingXp: tier / 10,
  };
  const log = itemDef(`Log${name}`, `${name} Log`, [ItemTag.Resource]);
  gatheringDef(log, lumberjacking, 'Cut', tier);
  const handle = itemDef(`Handle${name}`, `${name} Handle`, [ItemTag.Tool]);
  processingDef(log, handle, crafting, `Craft`, tier);
  equipToolDef(crafting, mining, handle, EquipmentSlot.MiningHandle, statBlock, tier);
  equipToolDef(crafting, lumberjacking, handle, EquipmentSlot.LumberjackingHandle, statBlock, tier);
  equipToolDef(crafting, crafting, handle, EquipmentSlot.CraftingHandle, statBlock, tier);
}
