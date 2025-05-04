import type { ServerSocket } from '@/back-end/core/server/server.socket';
import type { ServerData, SocketId } from '@/back-end/core/server/sockets/sockets.types';
import { SocketOpenEventToken, type SocketOpenEventListener } from '@/back-end/core/events/socket.event';
import { UserEventDispatcher } from '@/back-end/core/events/user.dispatcher';
import { SocketHub } from '@/back-end/core/server/sockets/socket.hub';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';

@injectableSingleton(SocketOpenEventToken)
export class AuthLogoutService implements SocketOpenEventListener {
  constructor(private readonly socketHub: SocketHub, private readonly userDispatch: UserEventDispatcher) {}

  onSocketOpen(socketId: SocketId): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId)!;
    socket.on('Auth/Logout', this.handleLogout.bind(this));
  }

  private handleLogout(socket: ServerSocket, {}: ServerData<'Auth/Logout'>) {
    const userId = this.socketHub.getUserId(socket.id)!;
    this.userDispatch.emitUserLoggedOut(socket.id, userId);
    socket.send('Auth/LogoutSuccess', {});
  }
}
