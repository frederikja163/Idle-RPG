import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import type { ServerData, SocketId } from '@/shared/socket/socket-types';

@injectableSingleton(SocketOpenEventToken)
export class ConnectionController implements SocketOpenEventListener {
  public constructor(private readonly socketHub: SocketHub) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId);
    socket?.on('Connection/Ping', this.handlePing.bind(this));
  }

  private handlePing(socketId: SocketId, {}: ServerData<'Connection/Ping'>) {
    this.socketHub.broadcastToSocket(socketId, 'Connection/Pong', {});
  }
}
