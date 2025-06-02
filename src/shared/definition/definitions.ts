import { gatheringDef, processingDef } from './definition-activities';
import { itemDef, ItemTag } from './definition-items';
import { skillDef } from './definition-skills';

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
  const ore = itemDef(`Ore${name}`, `${name} Ore`, ItemTag.Resource);
  gatheringDef(ore, mining, 'Mine', tier);
  const pickaxe = itemDef(`HeadPickaxe${name}`, `${name} Pickaxe Head`, ItemTag.Tool);
  processingDef(ore, pickaxe, crafting, 'Craft', tier);
  const axe = itemDef(`HeadAxe${name}`, `${name} Axe Head`, ItemTag.Tool);
  processingDef(ore, axe, crafting, 'Craft', tier);
  const hammer = itemDef(`HeadHammer${name}`, `${name} Hammer Head`, ItemTag.Tool);
  processingDef(ore, hammer, crafting, 'Craft', tier);
}

function wood(name: string, tier: number) {
  const log = itemDef(`Log${name}`, `${name} Log`, ItemTag.Resource);
  gatheringDef(log, lumberjacking, 'Cut', tier);
  const handle = itemDef(`Handle${name}`, `${name} Handle`, ItemTag.Tool);
  processingDef(log, handle, crafting, `Craft`, tier);
}
