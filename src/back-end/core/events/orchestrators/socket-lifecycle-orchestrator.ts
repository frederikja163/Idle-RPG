import { injectableSingleton } from '../../lib/lib-tsyringe';
import { SocketSessionStore } from '../../server/sockets/socket-session-store';
import { ProfileEventDispatcher } from '../profile-dispatcher';
import { SocketCloseEventToken, type SocketCloseEventData, type SocketCloseEventListener } from '../socket-event';
import { UserEventDispatcher } from '../user-dispatcher';

@injectableSingleton(SocketCloseEventToken)
export class SocketLifecycleOrchestrator implements SocketCloseEventListener {
  public constructor(
    private readonly socketSession: SocketSessionStore,
    private readonly userDispatcher: UserEventDispatcher,
    private readonly profileDispatcher: ProfileEventDispatcher,
  ) {}

  public onSocketClose({ socketId }: SocketCloseEventData): void | Promise<void> {
    const userId = this.socketSession.getUserId(socketId);
    if (!userId) return;

    const profileId = this.socketSession.getProfileId(socketId);
    if (profileId) this.profileDispatcher.emitProfileDeselected({ userId, profileId });
    this.userDispatcher.emitUserLoggedOut({ userId });
  }
}
