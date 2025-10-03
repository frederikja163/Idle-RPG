import { ErrorType, ServerError } from '../socket/socket-errors';
import type { ItemId } from './schema/types/types-items';

export enum ItemTag {
  Resource = 'Ressource',
  Tool = 'Tool',
}

export class ItemDef {
  private static readonly items = new Map<ItemId, ItemDef>();

  private constructor(
    private readonly _id: ItemId,
    private readonly _display: string,
    private readonly _tags: Set<ItemTag>,
  ) {}

  public get id(): ItemId {
    return this._id;
  }

  public get display(): string {
    return this._display;
  }

  public static createItem(id: ItemId, display: string, tags: ItemTag[]): ItemDef {
    const item = new ItemDef(id, display, new Set(tags));
    ItemDef.items.set(item.id, item);
    return item;
  }

  public static getById(id: ItemId) {
    return ItemDef.items.get(id);
  }

  public static requireById(id: ItemId) {
    const item = ItemDef.items.get(id);
    if (!item) throw new ServerError(ErrorType.InvalidItem);
    return item;
  }

  public *getTags() {
    for (const tag of this._tags) {
      yield tag;
    }
  }

  public hasTag(tag: ItemTag) {
    return this._tags.has(tag);
  }
}
