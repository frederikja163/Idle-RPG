import type { UserId } from '../../db/db.types';
import { injectableSingleton } from '../../lib/lib.tsyringe';
import type { SocketSessionStore } from '../../server/sockets/socket.session.store';
import type { SocketId } from '../../server/sockets/sockets.types';
import type { ProfileEventDispatcher } from '../profile.dispatcher';
import { SocketCloseEventToken, type SocketCloseEventListener } from '../socket.event';
import type { UserEventDispatcher } from '../user.dispatcher';
import { UserLogoutEventToken, type UserLogoutEventListener } from '../user.event';

@injectableSingleton(SocketCloseEventToken, UserLogoutEventToken)
export class SocketLifecycleOrchestrator implements SocketCloseEventListener, UserLogoutEventListener {
  public constructor(
    private readonly socketSession: SocketSessionStore,
    private readonly userDispatcher: UserEventDispatcher,
    private readonly profileDispatcher: ProfileEventDispatcher,
  ) {}

  public onSocketClose(socketId: SocketId) {
    const profile = this.socketSession.getProfileId(socketId);
    if (profile) this.profileDispatcher.emitProfileDeselected(socketId, profile);
    const user = this.socketSession.getUserId(socketId);
    if (user) this.userDispatcher.emitUserLoggedOut(socketId, user);
  }

  public onUserLoggedOut(socketId: SocketId, userId: UserId) {
    const profile = this.socketSession.getProfileId(socketId);
    if (profile) this.profileDispatcher.emitProfileDeselected(socketId, profile);
  }
}
