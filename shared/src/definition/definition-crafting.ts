import { resolveFuncs, zero, type Func, type FuncReplace } from '../lib/funcs';
import { ErrorType, ServerError } from '../socket/socket-errors';
import { type ItemDef } from './definition-items';
import type { SkillDef } from './definition-skills';

export type CraftingRecipeId = string;

export type ItemAmount = { item: ItemDef; amount: number };

export type SkillRequirement = { skill: SkillDef; xp: number; level: number };

export class CraftingRecipeBuilder {
  private constructor(
    private _xpDefault: Func = zero,
    private _levelDefault: Func = zero,
    private _costDefault: Func = zero,
    private _resultDefault: Func = zero,
    private _timeDefault: Func = zero,
    private readonly _skillRequirements: FuncReplace<SkillRequirement>[] = [],
    private readonly _costs: FuncReplace<ItemAmount>[] = [],
    private readonly _results: FuncReplace<ItemAmount>[] = [],
  ) {}

  public xp(xp: Func) {
    this._xpDefault = xp;
    return this;
  }

  public level(level: Func) {
    this._levelDefault = level;
    return this;
  }

  public costAmount(cost: Func) {
    this._costDefault = cost;
    return this;
  }

  public resultAmount(result: Func) {
    this._resultDefault = result;
    return this;
  }

  public time(time: Func) {
    this._timeDefault = time;
    return this;
  }

  public skill(skill: SkillDef, xp?: Func, level?: Func) {
    this._skillRequirements.push({ skill, level: level ?? this._levelDefault, xp: xp ?? this._xpDefault });
    return this;
  }
  public cost(item: ItemDef, amount?: Func) {
    this._costs.push({ item, amount: amount ?? this._costDefault });
    return this;
  }
  public result(item: ItemDef, amount?: Func) {
    this._results.push({ item, amount: amount ?? this._resultDefault });
    return this;
  }

  public copy() {
    return new CraftingRecipeBuilder(
      this._xpDefault,
      this._levelDefault,
      this._costDefault,
      this._resultDefault,
      this._timeDefault,
      this._skillRequirements.slice(),
      this._costs.slice(),
      this._results.slice(),
    );
  }

  public static createBuilder() {
    return new CraftingRecipeBuilder();
  }

  public build(item: ItemDef, actionName: string, tier: number, time?: number) {
    CraftingRecipeDef.createRecipe(
      item.id,
      `${actionName} ${item.display}`,
      time ?? this._timeDefault(tier),
      this._skillRequirements.map((s) => resolveFuncs(s, tier)),
      this._costs.map((a) => resolveFuncs(a, tier)),
      this._results.map((a) => resolveFuncs(a, tier)),
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
