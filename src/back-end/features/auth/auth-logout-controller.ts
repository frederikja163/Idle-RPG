import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import type { ServerData } from '@/back-end/core/server/sockets/socket-types';
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { UserEventDispatcher } from '@/back-end/core/events/user-dispatcher';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { ErrorType } from '@/shared/socket/socket.events';

@injectableSingleton(SocketOpenEventToken)
export class AuthLogoutController implements SocketOpenEventListener {
  constructor(private readonly socketHub: SocketHub, private readonly userDispatch: UserEventDispatcher) {}

  onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId)!;
    socket.on('Auth/Logout', this.handleLogout.bind(this));
  }

  private handleLogout(socket: ServerSocket, {}: ServerData<'Auth/Logout'>) {
    const userId = this.socketHub.getUserId(socket.id);
    if (!userId) {
      return socket.error(ErrorType.RequiresLogin);
    }
    this.userDispatch.emitUserLoggedOut({ userId });
    this.socketHub.setUserId(socket.id);
    socket.send('Auth/LogoutSuccess', {});
  }
}
