import type { ItemId, Item } from '@/shared/definition/schema/types/types-items';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import type { SkillId, Skill } from '@/shared/definition/schema/types/types-skills';
import type { ProfileInterface } from '@/shared/util/util-crafting';
import { SkillService } from '../skill/skill-service';
import { ItemService } from '../item/item-service';

export class ServerProfileInterface implements ProfileInterface {
  public constructor(
    private readonly profileId: ProfileId,
    private readonly skillService: SkillService,
    private readonly itemService: ItemService,
  ) {}

  async getItem(itemId: ItemId): Promise<Item> {
    return await this.itemService.getItemById(this.profileId, itemId);
  }
  async getSkill(skillId: SkillId): Promise<Skill> {
    return await this.skillService.getSkillById(this.profileId, skillId);
  }
}
