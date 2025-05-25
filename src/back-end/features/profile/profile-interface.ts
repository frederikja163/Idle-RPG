import type { ItemId, Item } from '@/shared/definition/schema/types/types-items';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import type { SkillId, Skill } from '@/shared/definition/schema/types/types-skills';
import type { ProfileInterface } from '@/shared/util/util-activities';
import type { SkillService } from '../skill/skill-service';
import type { ItemService } from '../item/item-service';

export class ServerProfileInterface implements ProfileInterface {
  public allSkills: Skill[] = [];
  public allItems: Item[] = [];

  public constructor(
    private readonly profileId: ProfileId,
    private readonly skillService: SkillService,
    private readonly itemService: ItemService,
  ) {}

  async getItem(itemId: ItemId): Promise<Item> {
    const item = await this.itemService.getItemById(this.profileId, itemId);
    this.allItems.push(item);
    return item;
  }
  async getSkill(skillId: SkillId): Promise<Skill> {
    const skill = await this.skillService.getSkillById(this.profileId, skillId);
    this.allSkills.push(skill);
    return skill;
  }
  save(): void {
    this.allSkills.forEach((s) => this.skillService.update(this.profileId, s.skillId));
    this.allItems.forEach((i) => this.itemService.update(this.profileId, i.itemId));
  }
}
