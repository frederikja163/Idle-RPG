import { ErrorType } from '@/shared/socket/socket-events';
import { OAuth2Client } from 'google-auth-library';
import { UserCache } from '../user/user.cache';
import type { ServerSocket } from '@/back-end/core/server/server.socket';
import type { ServerData, SocketId } from '@/back-end/core/server/sockets/sockets.types';
import { SocketOpenEventToken, type SocketOpenEventListener } from '@/back-end/core/events/socket.event';
import { UserEventDispatcher } from '@/back-end/core/events/user.dispatcher';
import { SocketHub } from '@/back-end/core/server/sockets/socket.hub';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';

@injectableSingleton(SocketOpenEventToken)
export class AuthGoogleSocketHandler implements SocketOpenEventListener {
  private readonly _googleOauthClient = new OAuth2Client(
    '758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com',
  );

  constructor(
    private readonly socketHub: SocketHub,
    private readonly userDispatch: UserEventDispatcher,
    private readonly userCache: UserCache,
  ) {}

  public onSocketOpen(socketId: SocketId): void {
    const socket = this.socketHub.getSocket(socketId)!;
    socket.on('Auth/GoogleLogin', this.authenticateGoogle.bind(this));
  }

  private async authenticateGoogle(socket: ServerSocket, data: ServerData<'Auth/GoogleLogin'>) {
    const ticket = await this._googleOauthClient.verifyIdToken({
      idToken: data.token,
      audience: '758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    if (!payload) return socket.error(ErrorType.InvalidInput);

    const { sub: googleId, email: email, picture: profilePicture, email_verified: emailVerified } = payload;

    if (!email) return socket.error(ErrorType.InvalidInput);
    if (!emailVerified) return socket.error(ErrorType.EmailNotVerified);

    const user = await this.userCache.findByGoogleId(googleId, email, profilePicture ?? '');
    this.userDispatch.emitUserLoggedIn(socket.id, user.id);
    socket.send('Auth/LoginSuccess', {});
  }
}
