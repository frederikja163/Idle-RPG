import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import type { ServerData } from '@/back-end/core/server/sockets/socket-types';
import { ErrorType, type ItemDto } from '@/shared/socket/socket.events';
import type { ItemType } from '@/back-end/core/db/db.types';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { InventoryService } from './inventory-service';

@injectableSingleton(SocketOpenEventToken)
export class InventoryController implements SocketOpenEventListener {
  public constructor(private readonly socketHub: SocketHub, private readonly inventoryService: InventoryService) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId)!;
    socket.on('Inventory/GetInventory', this.handleGetInventory.bind(this));
    socket.on('Inventory/SwapItems', this.handleSwapItems.bind(this));
  }

  private getDto(inventory: ItemType[]): ItemDto[] {
    return inventory.map((i) => ({
      ...i,
    }));
  }

  private async handleGetInventory(socket: ServerSocket, {}: ServerData<'Inventory/GetInventory'>) {
    const profileId = this.socketHub.getProfileId(socket.id);
    if (!profileId) return socket.error(ErrorType.RequiresProfile);

    const inventory = await this.inventoryService.getByProfileId(profileId);
    socket.send('Inventory/UpdateInventory', { items: this.getDto(inventory) });
  }

  private async handleSwapItems(socket: ServerSocket, { index1, index2 }: ServerData<'Inventory/SwapItems'>) {
    const profileId = this.socketHub.getProfileId(socket.id);
    if (!profileId) return socket.error(ErrorType.RequiresProfile);

    const inventory = await this.inventoryService.getByProfileId(profileId);
    if (index1 < 0 || index1 >= inventory.length || index2 < 0 || index2 >= inventory.length)
      return socket.error(ErrorType.ArgumentOutOfRange);

    [inventory[index1], inventory[index2]] = [inventory[index2], inventory[index1]];
    this.inventoryService.update(profileId, inventory);

    this.socketHub.broadcastToProfile(profileId, 'Inventory/UpdateInventory', { items: this.getDto(inventory) });
  }
}
