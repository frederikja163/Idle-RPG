import type { DataType } from "@/shared/socket";
import type { ServerData, ServerSocket } from "../server-socket";
import { ErrorType, type ClientServerEvent } from "@/shared/socket-events";
import { database } from "../database";

export function initInventoryEvents(socket: ServerSocket) {
  socket.on("Inventory/GetInventory", GetInventory);
  socket.on("Inventory/SwapItems", SwapItems);
}

async function GetInventory(
  socket: ServerSocket,
  {}: ServerData<"Inventory/GetInventory">
) {
  if (!socket.profile) return socket.error(ErrorType.RequiresProfile);

  const items = await database.getInventory(socket.profile.id);
  socket.send("Inventory/UpdateInventory", { items });
}

async function SwapItems(
  socket: ServerSocket,
  { index1, index2 }: ServerData<"Inventory/SwapItems">
) {
  if (!socket.profile) return socket.error(ErrorType.RequiresProfile);

  const items = await database.getInventory(socket.profile.id);
  if (
    index1 < 0 ||
    index1 > items.length ||
    index2 < 0 ||
    index2 > items.length
  )
    return socket.error(ErrorType.ArgumentOutOfRange);

  // temporary value of -1 so we maintain uniqueness.
  await database.setIndex(socket.profile.id, index1, -1);
  await database.setIndex(socket.profile.id, index2, index1);
  await database.setIndex(socket.profile.id, -1, index2);

  [items[index1], items[index2]] = [items[index2], items[index1]];

  socket.send("Inventory/UpdateInventory", { items });
}
