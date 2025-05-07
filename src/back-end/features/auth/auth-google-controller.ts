import { ErrorType } from '@/shared/socket/socket.events';
import { OAuth2Client } from 'google-auth-library';
import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket.ts';
import type { ServerData } from '@/back-end/core/server/sockets/socket-types.ts';
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event.ts';
import { UserEventDispatcher } from '@/back-end/core/events/user-dispatcher.ts';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub.ts';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe.ts';
import { UserService } from '../user/user-service.ts';

@injectableSingleton(SocketOpenEventToken)
export class AuthGoogleController implements SocketOpenEventListener {
  private readonly _googleOauthClient = new OAuth2Client(
    '758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com',
  );

  constructor(
    private readonly socketHub: SocketHub,
    private readonly userService: UserService,
    private readonly userDispatch: UserEventDispatcher,
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void {
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

    const oldUserId = this.socketHub.getUserId(socket.id);
    if (oldUserId) {
      this.userDispatch.emitUserLoggedOut({ userId: oldUserId });
      socket.send('Auth/LogoutSuccess', {});
    }

    const user =
      (await this.userService.getByGoogleId(googleId)) ??
      (await this.userService.createGoogleUser(googleId, email, profilePicture ?? ''));
    if (!user) return socket.error(ErrorType.InternalError);
    this.userDispatch.emitUserLoggedIn({ userId: user.id });
    this.socketHub.setUserId(socket.id, user.id);
    socket.send('Auth/LoginSuccess', {});
  }
}
