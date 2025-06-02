import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { ItemService } from './item-service';
import type { ServerData, SocketId } from '@/shared/socket/socket-types';
import type { Item } from '@/shared/definition/schema/types/types-items';

@injectableSingleton(SocketOpenEventToken)
export class ItemController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly itemService: ItemService,
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.requireSocket(socketId)!;
    socket.on('Item/GetItems', this.handleGetItems.bind(this));
    socket.on('Item/ChangeIndicies', this.handleSwapItems.bind(this));
  }

  private async handleGetItems(socketId: SocketId, { itemIds }: ServerData<'Item/GetItems'>) {
    const profileId = this.socketHub.requireProfileId(socketId);
    if (itemIds) {
      const items: Item[] = [];
      for (const itemId of itemIds) {
        const item = await this.itemService.getItemById(profileId, itemId);
        items.push(item);
      }
      return items;
    }

    const items = await this.itemService.getItemsByProfileId(profileId);
    this.socketHub.broadcastToSocket(socketId, 'Item/UpdateItems', { items });
  }

  private async handleSwapItems(socketId: SocketId, { itemIndicies }: ServerData<'Item/ChangeIndicies'>) {
    const profileId = this.socketHub.requireProfileId(socketId);

    const items: Item[] = [];
    for (const { itemId, index } of itemIndicies) {
      const item = await this.itemService.getItemById(profileId, itemId);
      item.index = index;
      items.push(item);
      this.itemService.update(profileId, itemId);
    }

    this.socketHub.broadcastToProfile(profileId, 'Item/UpdateItems', {
      items,
    });
  }
}
