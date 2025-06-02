import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { UserEventDispatcher } from '@/back-end/core/events/user-dispatcher';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import type { ServerData } from '@/shared/socket/socket-types';
import { UserService } from './user-service';
import { OAuth2Client } from 'google-auth-library';
import { ErrorType } from '@/shared/socket/socket-errors';

@injectableSingleton(SocketOpenEventToken)
export class UserController implements SocketOpenEventListener {
  private readonly _googleOauthClient = new OAuth2Client(
    '758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com',
  );

  public constructor(
    private readonly socketHub: SocketHub,
    private readonly userService: UserService,
    private readonly userDispatch: UserEventDispatcher,
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId)!;
    socket.on('User/Logout', this.handleLogout.bind(this));
    socket.on('User/GoogleLogin', this.handleGoogleLogin.bind(this));
    socket.on('User/GetUser', this.handleGetUser.bind(this));
    socket.on('User/SetSettings', this.handleSetSettings.bind(this));
  }

  private handleLogout(socket: ServerSocket, _: ServerData<'User/Logout'>) {
    const userId = this.socketHub.requireUserId(socket.id);
    this.userDispatch.emitUserLoggedOut({ userId });
    this.socketHub.setUserId(socket.id);
    socket.send('User/LogoutSuccess', {});
  }

  private async handleGoogleLogin(socket: ServerSocket, data: ServerData<'User/GoogleLogin'>) {
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
      socket.send('User/LogoutSuccess', {});
    }

    const user = await this.userService.getOrCreateByGoogle(googleId, email, profilePicture ?? '');
    this.userDispatch.emitUserLoggedIn({ userId: user.id });
    this.socketHub.setUserId(socket.id, user.id);
    socket.send('User/LoginSuccess', {});
  }

  private async handleSetSettings(socket: ServerSocket, { settings }: ServerData<'Profile/SetSettings'>) {
    const userId = this.socketHub.requireProfileId(socket.id);
    const user = await this.userService.getByUserId(userId);

    user.settings = settings;
    this.userService.updateUser(userId);

    this.socketHub.broadcastToUser(userId, 'User/UpdateUser', {
      user,
    });
  }

  private async handleGetUser(socket: ServerSocket, _: ServerData<'User/GetUser'>) {
    const userId = await this.socketHub.requireUserId(socket.id);
    const user = await this.userService.getByUserId(userId);

    socket.send('User/UpdateUser', { user });
  }
}
