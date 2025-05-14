import type { ServerSocket } from "@/back-end/core/server/sockets/server-socket";
import { SocketHub } from "@/back-end/core/server/sockets/socket-hub";
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from "@/back-end/core/events/socket-event";
import { injectableSingleton } from "@/back-end/core/lib/lib-tsyringe";
import { ItemService } from "./item-service";
import type { ServerData } from "@/shared/socket/socket-types";
import { ErrorType } from "@/shared/socket/socket-errors";

@injectableSingleton(SocketOpenEventToken)
export class ItemController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly itemService: ItemService
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId)!;
    socket.on("Item/GetItems", this.handleGetItems.bind(this));
    socket.on("Item/SwapItems", this.handleSwapItems.bind(this));
  }

  private async handleGetItems(
    socket: ServerSocket,
    _: ServerData<"Item/GetItems">
  ) {
    const profileId = this.socketHub.requireProfileId(socket.id);

    const items = await this.itemService.getItemsByProfileId(profileId);
    socket.send("Item/UpdateItems", { items });
  }

  private async handleSwapItems(
    socket: ServerSocket,
    { index1, index2 }: ServerData<"Item/SwapItems">
  ) {
    const profileId = this.socketHub.requireProfileId(socket.id);

    const items = await this.itemService.getItemsByProfileId(profileId);
    if (
      index1 < 0 ||
      index1 >= items.length ||
      index2 < 0 ||
      index2 >= items.length
    )
      return socket.error(ErrorType.ArgumentOutOfRange);

    [items[index1].index, items[index2].index] = [
      items[index2].index,
      items[index1].index,
    ];
    this.itemService.updateItem(profileId, items[index1].itemId);
    this.itemService.updateItem(profileId, items[index2].itemId);

    this.socketHub.broadcastToProfile(profileId, "Item/UpdateItems", {
      items: items,
    });
  }
}
