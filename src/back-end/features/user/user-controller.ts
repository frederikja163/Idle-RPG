import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { UserEventDispatcher } from '@/back-end/core/events/user-dispatcher';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import type { ServerData, SocketId } from '@/shared/socket/socket-types';
import { UserService } from './user-service';
import { OAuth2Client } from 'google-auth-library';
import { ErrorType, ServerError } from '@/shared/socket/socket-errors';
import { transformQuery, updateValue } from '@/back-end/core/lib/lib-query-transform';

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
    const socket = this.socketHub.requireSocket(socketId)!;
    socket.on('User/Logout', this.handleLogout.bind(this));
    socket.on('User/GoogleLogin', this.handleGoogleLogin.bind(this));
    socket.on('User/Query', this.handleQuery.bind(this));
    socket.on('User/Update', this.handleUpdate.bind(this));
  }

  private handleLogout(socketId: SocketId, _: ServerData<'User/Logout'>) {
    const userId = this.socketHub.requireUserId(socketId);
    this.userDispatch.emitUserLoggedOut({ userId });
    this.socketHub.setUserId(socketId);
    this.socketHub.broadcastToSocket(socketId, 'User/LoggedOut', {});
  }

  private async handleGoogleLogin(socketId: SocketId, data: ServerData<'User/GoogleLogin'>) {
    const ticket = await this._googleOauthClient.verifyIdToken({
      idToken: data.token,
      audience: '758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();
    if (!payload) throw new ServerError(ErrorType.InvalidInput);

    const { sub: googleId, email: email, picture: profilePicture, email_verified: emailVerified } = payload;

    if (!email) throw new ServerError(ErrorType.InvalidInput);
    if (!emailVerified) throw new ServerError(ErrorType.EmailNotVerified);

    const oldUserId = this.socketHub.getUserId(socketId);
    if (oldUserId) {
      this.userDispatch.emitUserLoggedOut({ userId: oldUserId });
      this.socketHub.broadcastToSocket(socketId, 'User/LoggedOut', {});
    }

    const user = await this.userService.getOrCreateByGoogle(googleId, email, profilePicture ?? '');
    this.userDispatch.emitUserLoggedIn({ userId: user.id });
    this.socketHub.setUserId(socketId, user.id);
    this.socketHub.broadcastToSocket(socketId, 'User/LoggedIn', {});
  }

  private async handleQuery(socketId: SocketId, { user }: ServerData<'User/Query'>) {
    const userId = await this.socketHub.requireUserId(socketId);
    const userResult = transformQuery(await this.userService.getByUserId(userId), user);

    this.socketHub.broadcastToSocket(socketId, 'User/Updated', { user: userResult });
  }

  private async handleUpdate(socketId: SocketId, { user }: ServerData<'User/Update'>) {
    const userId = this.socketHub.requireProfileId(socketId);
    const userResult = updateValue(await this.userService.getByUserId(userId), user);

    await this.userService.updateUser(userId);

    this.socketHub.broadcastToUser(userId, 'User/Updated', {
      user: userResult,
    });
  }
}
