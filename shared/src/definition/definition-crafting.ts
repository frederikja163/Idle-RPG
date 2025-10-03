import { ErrorType, ServerError } from '../socket/socket-errors';
import { type ItemDef } from './definition-items';
import type { SkillDef } from './definition-skills';

export type CraftingRecipeId = string;

export type ItemAmount = { item: ItemDef; amount: number };
function itemAmount(itemId: ItemDef, amount: number): ItemAmount {
  return { item: itemId, amount };
}

export type SkillRequirement = { skill: SkillDef; level: number; xp: number };
function skillRequirement(skillId: SkillDef, level: number, xp: number = 0): SkillRequirement {
  return { skill: skillId, level, xp };
}

export class CraftingRecipeBuilder {
  private constructor(
    private readonly _id: CraftingRecipeId,
    private readonly _display: string,
    private readonly _time: number,
    private readonly _skillRequirements: SkillRequirement[] = [],
    private readonly _costs: ItemAmount[] = [],
    private readonly _results: ItemAmount[] = [],
  ) {}

  public addSkillRequirement(...args: Parameters<typeof skillRequirement>) {
    this._skillRequirements.push(skillRequirement(...args));
    return this;
  }
  public addCost(...args: Parameters<typeof itemAmount>) {
    this._costs.push(itemAmount(...args));
    return this;
  }
  public addResult(...args: Parameters<typeof itemAmount>) {
    this._results.push(itemAmount(...args));
    return this;
  }

  public static createBuilder(id: CraftingRecipeId, display: string, time: number) {
    return new CraftingRecipeBuilder(id, display, time);
  }

  public build() {
    CraftingRecipeDef.createRecipe(
      this._id,
      this._display,
      this._time,
      this._skillRequirements,
      this._costs,
      this._results,
    );
  }
}

export class CraftingRecipeDef {
  private constructor(
    private readonly _id: CraftingRecipeId,
    private readonly _display: string,
    private readonly _time: number,
    private readonly _skillRequirements: SkillRequirement[],
    private readonly _cost: ItemAmount[],
    private readonly _result: ItemAmount[],
  ) {}
  public get id(): CraftingRecipeId {
    return this._id;
  }
  public get display(): string {
    return this._display;
  }
  public get time(): number {
    return this._time;
  }
  public *getSkillRequirements() {
    for (const skillRequirement of this._skillRequirements) {
      yield skillRequirement;
    }
  }
  public *getCosts() {
    for (const cost of this._cost) {
      yield cost;
    }
  }
  public *getResults() {
    for (const result of this._result) {
      yield result;
    }
  }

  private static readonly craftingRecipes = new Map<CraftingRecipeId, CraftingRecipeDef>();

  public static createRecipe(
    id: CraftingRecipeId,
    display: string,
    time: number,
    skillRequirements: SkillRequirement[],
    cost: ItemAmount[],
    result: ItemAmount[],
  ) {
    const recipe = new CraftingRecipeDef(id, display, time, skillRequirements, cost, result);
    CraftingRecipeDef.craftingRecipes.set(recipe._id, recipe);
    return recipe;
  }

  public static createGathering(result: ItemDef, skill: SkillDef, activityName: string, tier: number) {
    return CraftingRecipeBuilder.createBuilder(`${result.id}`, `${activityName} ${result.display}`, 5000)
      .addSkillRequirement(skill, tier * 10, tier + 1)
      .addResult(result, 1)
      .build();
  }
  public static createProcessing(cost: ItemDef, result: ItemDef, skill: SkillDef, activityName: string, tier: number) {
    return CraftingRecipeBuilder.createBuilder(`${result.id}`, `${activityName} ${result.display}`, 5000)
      .addSkillRequirement(skill, tier * 10, tier + 1)
      .addCost(cost, 1)
      .addResult(result, 1)
      .build();
  }

  public static getById(id: CraftingRecipeId) {
    return CraftingRecipeDef.craftingRecipes.get(id);
  }

  public static requireById(id: CraftingRecipeId) {
    const recipe = CraftingRecipeDef.craftingRecipes.get(id);
    if (!recipe) throw new ServerError(ErrorType.InvalidCraftingRecipe);
    return recipe;
  }

  public static *getAllRecipes() {
    for (const recipe of CraftingRecipeDef.craftingRecipes) {
      yield recipe;
    }
  }
}
