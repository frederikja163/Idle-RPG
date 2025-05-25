import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { ItemService } from './item-service';
import type { ServerData } from '@/shared/socket/socket-types';
import type { Item } from '@/shared/definition/schema/types/types-items';

@injectableSingleton(SocketOpenEventToken)
export class ItemController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly itemService: ItemService,
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId)!;
    socket.on('Item/GetItems', this.handleGetItems.bind(this));
    socket.on('Item/SwapItems', this.handleSwapItems.bind(this));
  }

  private async handleGetItems(socket: ServerSocket, { itemIds }: ServerData<'Item/GetItems'>) {
    const profileId = this.socketHub.requireProfileId(socket.id);
    if (itemIds) {
      const items: Item[] = [];
      for (const itemId of itemIds) {
        const item = await this.itemService.getItemById(profileId, itemId);
        items.push(item);
      }
      return items;
    }

    const items = await this.itemService.getItemsByProfileId(profileId);
    socket.send('Item/UpdateItems', { items });
  }

  private async handleSwapItems(socket: ServerSocket, { itemId1, itemId2 }: ServerData<'Item/SwapItems'>) {
    const profileId = this.socketHub.requireProfileId(socket.id);

    const item1 = await this.itemService.getItemById(profileId, itemId1);
    const item2 = await this.itemService.getItemById(profileId, itemId2);

    [item1.index, item2.index] = [item2.index, item1.index];

    this.itemService.update(profileId, item1.itemId);
    this.itemService.update(profileId, item2.itemId);

    this.socketHub.broadcastToProfile(profileId, 'Item/UpdateItems', {
      items: [item1, item2],
    });
  }
}
