import { craftingToolDef, gatheringDef, processingDef } from './definition-activities';
import { itemDef, ItemTag, type ItemDef } from './definition-items';
import { skillDef, type SkillDef } from './definition-skills';

const mining = skillDef('Mining');
const refining = skillDef('Refining');
const lumberjacking = skillDef('Lumberjacking');
const carpentry = skillDef('Carpentry');

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

function tool(part: string, tool: string, name: string, cost: ItemDef, skill: SkillDef, tier: number) {
  const result = itemDef(`${part}${tool}${name}`, `${part} ${tool} ${name}`, ItemTag.Tool);
  craftingToolDef(cost, result, skill, tier);
}

function tools(part: string, name: string, cost: ItemDef, skill: SkillDef, tier: number) {
  tool(part, 'Pickaxe', name, cost, skill, tier);
  tool(part, 'Hammer', name, cost, skill, tier);
  tool(part, 'Axe', name, cost, skill, tier);
  tool(part, 'Saw', name, cost, skill, tier);
}

function ore(name: string, tier: number) {
  const ore = itemDef(`Ore${name}`, `${name} Ore`, ItemTag.Resource);
  gatheringDef(ore, mining, 'Mine', tier);
  const refined = itemDef(`Refined${name}`, `Refined ${name}`, ItemTag.Resource);
  processingDef(ore, refined, refining, 'Refine', tier);
  tools('Head', name, refined, refined, tier);
}

function wood(name: string, tier: number) {
  const log = itemDef(`Log${name}`, `${name} Log`, ItemTag.Resource);
  gatheringDef(log, lumberjacking, 'Cut', tier);
  const plank = itemDef(`Plank${name}`, `${name} Plank`, ItemTag.Resource);
  processingDef(log, plank, carpentry, 'Carve', tier);
  tools('Handle', name, plank, carpentry, tier);
}
