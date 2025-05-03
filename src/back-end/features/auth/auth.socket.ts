import { SessionStore } from '@/back-end/core/session/session.store';
import type { ServerSocket } from '@/back-end/core/sockets/server.socket';
import { SocketCache } from '@/back-end/core/sockets/socket.cache';
import type { ISocketHandler } from '@/back-end/core/sockets/socket.ihandler';
import type { ServerData } from '@/back-end/core/sockets/sockets.types';
import { injectable, singleton } from 'tsyringe';

@injectable()
@singleton()
export class AuthSocketHandler implements ISocketHandler {
  constructor(private readonly sessionStore: SessionStore, private readonly socketCache: SocketCache) {}

  public handleSocketOpen(socket: ServerSocket): void {
    socket.on('Auth/Logout', this.logout.bind(this));
  }

  private logout(socket: ServerSocket, {}: ServerData<'Auth/Logout'>) {
    const session = this.sessionStore.get(socket.id);

    if (session.user) {
      this.socketCache.removeUserId(session.user?.id, socket);
      session.resetUser();
    }

    socket.send('Auth/LogoutSuccess', {});
  }
}
