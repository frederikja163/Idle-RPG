import { SessionStore } from '@/back-end/core/session/session.store';
import type { ServerSocket } from '@/back-end/core/sockets/server.socket';
import type { ISocketHandler } from '@/back-end/core/sockets/socket.ihandler';
import type { ServerData } from '@/back-end/core/sockets/sockets.types';
import { injectable, singleton } from 'tsyringe';
import { InventoryCache } from './inventory.cache';
import { ErrorType, type ItemDto } from '@/shared/socket-events';
import type { ItemType } from '@/back-end/core/db/db.types';

@injectable()
@singleton()
export class InventorySocketHandler implements ISocketHandler {
  public constructor(private readonly sessionStore: SessionStore, private readonly inventoryCache: InventoryCache) {}

  public handleSocketOpen(socket: ServerSocket): void {
    socket.on('Inventory/GetInventory', this.getInventory.bind(this));
    socket.on('Inventory/SwapItems', this.swapItems.bind(this));
  }

  private getDto(inventory: ItemType[]): ItemDto[] {
    return inventory.map((i) => ({
      ...i,
    }));
  }

  private async getInventory(socket: ServerSocket, {}: ServerData<'Inventory/GetInventory'>) {
    const profile = this.sessionStore.get(socket.id).profile;
    if (!profile) return socket.error(ErrorType.RequiresProfile);

    const inventory = await this.inventoryCache.getByProfileId(profile.id);
    socket.send('Inventory/UpdateInventory', { items: this.getDto(inventory) });
  }

  private async swapItems(socket: ServerSocket, { index1, index2 }: ServerData<'Inventory/SwapItems'>) {
    const profile = this.sessionStore.get(socket.id).profile;
    if (!profile) return socket.error(ErrorType.RequiresProfile);

    const inventory = await this.inventoryCache.getByProfileId(profile.id);
    if (index1 < 0 || index1 >= inventory.length || index2 < 0 || index2 >= inventory.length)
      return socket.error(ErrorType.ArgumentOutOfRange);

    // temporary value of -1 so we maintain uniqueness.
    [inventory[index1], inventory[index2]] = [inventory[index2], inventory[index1]];

    socket.send('Inventory/UpdateInventory', { items: this.getDto(inventory) });
  }
}
