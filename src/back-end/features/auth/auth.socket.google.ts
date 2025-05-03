import { ErrorType } from '@/shared/socket-events';
import { OAuth2Client } from 'google-auth-library';
import { UserCache } from '../user/user.cache';
import { injectable, singleton } from 'tsyringe';
import { SessionStore } from '@/back-end/core/session/session.store';
import type { ServerSocket } from '@/back-end/core/sockets/server.socket';
import { SocketCache } from '@/back-end/core/sockets/socket.cache';
import type { ISocketHandler } from '@/back-end/core/sockets/socket.ihandler';
import type { ServerData } from '@/back-end/core/sockets/sockets.types';

@injectable()
@singleton()
export class AuthGoogleSocketHandler implements ISocketHandler {
  private readonly _googleOauthClient = new OAuth2Client(
    '758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com',
  );

  constructor(
    private readonly sessionStore: SessionStore,
    private readonly userCache: UserCache,
    private readonly socketCache: SocketCache,
  ) {}

  public handleSocketOpen(socket: ServerSocket): void {
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
    this.socketCache.addUserId(user.id, socket);
    const session = this.sessionStore.get(socket.id);
    session.user = user;
    socket.send('Auth/LoginSuccess', {});
  }
}
