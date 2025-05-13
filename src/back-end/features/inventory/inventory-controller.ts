import type { ServerSocket } from "@/back-end/core/server/sockets/server-socket";
import { SocketHub } from "@/back-end/core/server/sockets/socket-hub";
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from "@/back-end/core/events/socket-event";
import { injectableSingleton } from "@/back-end/core/lib/lib-tsyringe";
import { InventoryService } from "./inventory-service";
import type { ServerData } from "@/shared/socket/socket-types";
import { ErrorType } from "@/shared/socket/socket-errors";

@injectableSingleton(SocketOpenEventToken)
export class InventoryController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly inventoryService: InventoryService
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId)!;
    socket.on("Inventory/GetInventory", this.handleGetInventory.bind(this));
    socket.on("Inventory/SwapItems", this.handleSwapItems.bind(this));
  }

  private async handleGetInventory(
    socket: ServerSocket,
    _: ServerData<"Inventory/GetInventory">
  ) {
    const profileId = this.socketHub.getProfileId(socket.id);
    if (!profileId) return socket.error(ErrorType.RequiresProfile);

    const inventory = await this.inventoryService.getByProfileId(profileId);
    socket.send("Inventory/UpdateInventory", { items: inventory });
  }

  private async handleSwapItems(
    socket: ServerSocket,
    { index1, index2 }: ServerData<"Inventory/SwapItems">
  ) {
    const profileId = this.socketHub.getProfileId(socket.id);
    if (!profileId) return socket.error(ErrorType.RequiresProfile);

    const inventory = await this.inventoryService.getByProfileId(profileId);
    if (
      index1 < 0 ||
      index1 >= inventory.length ||
      index2 < 0 ||
      index2 >= inventory.length
    )
      return socket.error(ErrorType.ArgumentOutOfRange);

    [inventory[index1].index, inventory[index2].index] = [
      inventory[index2].index,
      inventory[index1].index,
    ];
    this.inventoryService.updateInventory(profileId);

    this.socketHub.broadcastToProfile(profileId, "Inventory/UpdateInventory", {
      items: inventory,
    });
  }
}
