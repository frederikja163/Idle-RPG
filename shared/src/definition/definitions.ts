import { constant, linear } from '../lib/funcs';
import { CraftingRecipeBuilder } from './definition-crafting';
import { ItemDef, ItemTag } from './definition-items';
import { SkillDef } from './definition-skills';
import { StatBlockBuilder } from './definition-stats';

const recipeBuilder = CraftingRecipeBuilder.createBuilder()
  .xp(linear(1, 1))
  .level(linear(0, 10))
  .costAmount(constant(1))
  .resultAmount(constant(1))
  .time(constant(5000));
const gatheringRecipeBuilder = recipeBuilder.copy();
const processingRecipeBuilder = recipeBuilder.copy();

const toolStatBuilder = StatBlockBuilder.createBuilder().stat('craftingXp', linear(1, 0.1));
const handleStatBuilder = toolStatBuilder.copy().stat('speed', linear(1, 0.5));
const headStatBuilder = toolStatBuilder.copy().stat('productivity', linear(1, 0.5));

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
  gatheringRecipeBuilder.copy().skill(mining).result(ore).build(ore, `Mine`, tier);

  const pickaxe = ItemDef.createItem(`HeadPickaxe${name}`, `${name} Pickaxe Head`, [ItemTag.Tool]);
  headStatBuilder.build('Head', pickaxe, mining, tier);
  processingRecipeBuilder.copy().skill(crafting).cost(ore).result(pickaxe).build(pickaxe, `Craft`, tier);

  const axe = ItemDef.createItem(`HeadAxe${name}`, `${name} Axe Head`, [ItemTag.Tool]);
  headStatBuilder.build('Head', axe, lumberjacking, tier);
  processingRecipeBuilder.copy().skill(crafting).cost(ore).result(axe).build(axe, `Craft`, tier);

  const hammer = ItemDef.createItem(`HeadHammer${name}`, `${name} Hammer Head`, [ItemTag.Tool]);
  headStatBuilder.build('Head', hammer, crafting, tier);
  processingRecipeBuilder.copy().skill(crafting).cost(ore).result(hammer).build(hammer, `Craft`, tier);
}

function wood(name: string, tier: number) {
  const log = ItemDef.createItem(`Log${name}`, `${name} Log`, [ItemTag.Resource]);
  gatheringRecipeBuilder.copy().skill(lumberjacking).result(log).build(log, `Mine`, tier);

  const handle = ItemDef.createItem(`Handle${name}`, `${name} Handle`, [ItemTag.Tool]);
  processingRecipeBuilder.copy().skill(crafting).cost(log).result(handle).build(handle, `Craft`, tier);
  handleStatBuilder.build('Handle', handle, mining, tier);
  handleStatBuilder.build('Handle', handle, lumberjacking, tier);
  handleStatBuilder.build('Handle', handle, crafting, tier);
}
