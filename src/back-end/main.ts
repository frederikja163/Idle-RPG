import { server } from "./server";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  "758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com"
);

server.onSocketOpen((socket) => {
  socket.on("Ping", (d) => socket.send("Pong", {}));
  socket.on("Account/Authenticate", (d) => authenticate(d.token));
});

async function authenticate(token: string) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:
      "758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com",
  });
  console.log(ticket);
}
