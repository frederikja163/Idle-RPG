import { OAuth2Client } from 'google-auth-library';
import { database } from '../db/database';
import type { ServerData, ServerSocket } from '../server-socket';
import { ErrorType, type ClientServerEvent } from '@/shared/socket-events';
import type { DataType } from '@/shared/socket';
import { User } from '../db/user';

export function initAuthenticationEvents(socket: ServerSocket) {
  socket.on('Authentication/GoogleLogin', authenticateGoogle);
  socket.on('Authentication/Logout', logout);
}

function logout(socket: ServerSocket, {}: ServerData<'Authentication/Logout'>) {
  socket.logout();
  socket.send('Authentication/LogoutSuccess', {});
}

const googleOauthClient = new OAuth2Client('758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com');

async function authenticateGoogle(socket: ServerSocket, data: ServerData<'Authentication/GoogleLogin'>) {
  const ticket = await googleOauthClient.verifyIdToken({
    idToken: data.token,
    audience: '758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com',
  });

  const payload = ticket.getPayload();
  if (!payload) return socket.error(ErrorType.InvalidInput);

  const { sub: googleId, email: email, picture: profilePicture, email_verified: emailVerified } = payload;

  if (!email) return socket.error(ErrorType.InvalidInput);
  if (!emailVerified) return socket.error(ErrorType.EmailNotVerified);

  const user = await User.createOrGetGoogle(socket, googleId, email, profilePicture ?? '');
  socket.user = user;
  socket.send('Authentication/LoginSuccess', {});
}
