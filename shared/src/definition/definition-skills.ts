import { ErrorType, ServerError } from '../socket/socket-errors';
import type { SkillId } from './schema/types/types-skills';

export type SlotId = 'Head' | 'Handle';

export class SkillDef {
  private constructor(
    private readonly _id: SkillId,
    private readonly _slots: Set<SlotId>,
  ) {}

  public get id(): SkillId {
    return this._id;
  }
  public get display(): string {
    return this._id;
  }
  public *slots() {
    for (const slot of this._slots) {
      yield slot;
    }
  }

  private static readonly skills = new Map<SkillId, SkillDef>();

  public static createSkill(id: SkillId, slots: SlotId[]) {
    const skill = new SkillDef(id, new Set<SlotId>(slots));
    SkillDef.skills.set(skill.id, skill);
    return skill;
  }

  public static getById(id: SkillId) {
    return SkillDef.skills.get(id);
  }

  public static requireById(id: SkillId) {
    const skill = SkillDef.skills.get(id);
    if (!skill) throw new ServerError(ErrorType.InvalidSkill);
    return skill;
  }

  public static *getAllSkills() {
    for (const skill of SkillDef.skills) {
      yield skill;
    }
  }
}
