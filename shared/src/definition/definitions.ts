import { CraftingRecipeDef } from './definition-crafting';
import { ItemDef, ItemTag } from './definition-items';
import { SkillDef } from './definition-skills';

const mining = SkillDef.createSkill('Mining', ['Handle', 'Head']);
const lumberjacking = SkillDef.createSkill('Lumberjacking', ['Handle', 'Head']);
const crafting = SkillDef.createSkill('Crafting', ['Handle', 'Head']);

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
  const ore = ItemDef.createItem(`Ore${name}`, `${name} Ore`, [ItemTag.Resource]);
  CraftingRecipeDef.createGathering(ore, mining, 'Mine', tier);
  const pickaxe = ItemDef.createItem(`HeadPickaxe${name}`, `${name} Pickaxe Head`, [ItemTag.Tool]);
  CraftingRecipeDef.createProcessing(ore, pickaxe, crafting, 'Craft', tier);
  const axe = ItemDef.createItem(`HeadAxe${name}`, `${name} Axe Head`, [ItemTag.Tool]);
  CraftingRecipeDef.createProcessing(ore, axe, crafting, 'Craft', tier);
  const hammer = ItemDef.createItem(`HeadHammer${name}`, `${name} Hammer Head`, [ItemTag.Tool]);
  CraftingRecipeDef.createProcessing(ore, hammer, crafting, 'Craft', tier);
}

function wood(name: string, tier: number) {
  const log = ItemDef.createItem(`Log${name}`, `${name} Log`, [ItemTag.Resource]);
  CraftingRecipeDef.createGathering(log, lumberjacking, 'Cut', tier);
  const handle = ItemDef.createItem(`Handle${name}`, `${name} Handle`, [ItemTag.Tool]);
  CraftingRecipeDef.createProcessing(log, handle, crafting, `Craft`, tier);
}
