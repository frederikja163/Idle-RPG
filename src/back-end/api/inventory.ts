import type { DataType } from '@/shared/socket';
import type { ServerData, ServerSocket } from '../server-socket';
import { ErrorType, type ClientServerEvent } from '@/shared/socket-events';
import { database } from '../db/database';

export function initInventoryEvents(socket: ServerSocket) {
  socket.on('Inventory/GetInventory', GetInventory);
  socket.on('Inventory/SwapItems', SwapItems);
}

async function GetInventory(socket: ServerSocket, {}: ServerData<'Inventory/GetInventory'>) {
  const inventory = socket.inventory;
  if (!inventory) return socket.error(ErrorType.RequiresProfile);

  socket.send('Inventory/UpdateInventory', { items: inventory.items });
}

async function SwapItems(socket: ServerSocket, { index1, index2 }: ServerData<'Inventory/SwapItems'>) {
  const inventory = socket.inventory;
  if (!inventory) return socket.error(ErrorType.RequiresProfile);

  const items = inventory.items;
  if (index1 < 0 || index1 >= items.length || index2 < 0 || index2 >= items.length)
    return socket.error(ErrorType.ArgumentOutOfRange);

  // temporary value of -1 so we maintain uniqueness.
  [items[index1], items[index2]] = [items[index2], items[index1]];
  inventory.save();

  socket.send('Inventory/UpdateInventory', { items });
}
