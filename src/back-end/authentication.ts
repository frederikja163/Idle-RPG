import { OAuth2Client } from "google-auth-library";
import { database } from "./database";
import type { ServerSocket } from "./server-socket";
import { ErrorType, type ClientServerEvent } from "@/shared/socket-events";
import { getProfileDtos } from "./profiles";

export function initAuthenticationEvents(socket: ServerSocket) {
  socket.on("Authentication/GoogleLogin", authenticateGoogle);
  socket.on("Authentication/Logout", logout);
}

function logout(
  socket: ServerSocket,
  data: ClientServerEvent["Authentication/Logout"]
) {
  socket.user = null;
  socket.profile = null;
  socket.send("Authentication/LogoutSuccess", {});
}

const googleOauthClient = new OAuth2Client(
  "758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com"
);

async function authenticateGoogle(
  socket: ServerSocket,
  data: ClientServerEvent["Authentication/GoogleLogin"]
) {
  const ticket = await googleOauthClient.verifyIdToken({
    idToken: data.token,
    audience:
      "758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com",
  });

  const payload = ticket.getPayload();
  if (!payload) return;

  const {
    sub: googleId,
    email: email,
    picture: profilePicture,
    email_verified: emailVerified,
  } = payload;

  if (!email) return;
  if (!emailVerified) return socket.error(ErrorType.EmailNotVerified);

  const user = await database.upsertUser(googleId, email!, profilePicture);
  socket.user = user;
  const profiles = await getProfileDtos(user.id);
  socket.send("Authentication/LoginSuccess", {
    profiles: profiles,
  });
}
