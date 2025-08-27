import {
  type SocketOpenEventData,
  type SocketOpenEventListener,
  SocketOpenEventToken,
} from '@/backend/core/events/socket-event';
import { injectableSingleton } from '@/backend/core/lib/lib-tsyringe';
import { SocketHub } from '@/backend/core/server/sockets/socket-hub';
import type { ServerData, SocketId } from '@/shared/socket/socket-types';

@injectableSingleton(SocketOpenEventToken)
export class ConnectionController implements SocketOpenEventListener {
  public constructor(private readonly socketHub: SocketHub) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId);
    socket?.on('Connection/Ping', this.handlePing.bind(this));
  }

  private handlePing(socketId: SocketId, _: ServerData<'Connection/Ping'>) {
    this.socketHub.broadcastToSocket(socketId, 'Connection/Pong', {});
  }
}
