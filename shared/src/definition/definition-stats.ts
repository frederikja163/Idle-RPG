import { resolveFuncs, zero, type FuncReplace } from '../lib/funcs';
import type { ItemDef } from './definition-items';
import type { SkillDef, SlotId } from './definition-skills';

export type StatBlock = {
  speed: number;
  productivity: number;
  xp: number;
  craftingXp: number;
};

export class StatBlockBuilder {
  private constructor(
    private readonly _defaultStats: FuncReplace<StatBlock> = {
      speed: zero,
      productivity: zero,
      xp: zero,
      craftingXp: zero,
    },
  ) {}

  public stat<TKey extends keyof StatBlock, TVal extends FuncReplace<StatBlock>[TKey]>(key: TKey, val: TVal) {
    this._defaultStats[key] = val;
    return this;
  }

  public copy() {
    return new StatBlockBuilder(this._defaultStats);
  }

  public build(slot: SlotId, item: ItemDef, skill: SkillDef, tier: number) {
    return StatBlockDef.createStatBlock(slot, skill, item, resolveFuncs(this._defaultStats, tier));
  }

  public static createBuilder() {
    return new StatBlockBuilder();
  }
}

export class StatBlockDef {
  private constructor(
    private readonly _slot: SlotId,
    private readonly _skill: SkillDef,
    private readonly _item: ItemDef,
    private readonly _statBlock: Partial<StatBlock>,
  ) {}

  public get slot(): SlotId {
    return this._slot;
  }
  public get skill(): SkillDef {
    return this._skill;
  }
  public get item(): ItemDef {
    return this._item;
  }
  public get<TKey extends keyof StatBlock>(key: TKey) {
    return this._statBlock[key];
  }

  private static readonly statBlocks: StatBlockDef[] = [];

  public static createStatBlock(slot: SlotId, skill: SkillDef, item: ItemDef, statBlock: StatBlock): StatBlockDef {
    const statblock = new StatBlockDef(slot, skill, item, statBlock);
    StatBlockDef.statBlocks.push(statblock);
    return statblock;
  }
}
