import { Socket } from "@/shared/socket";
import { initAuthenticationEvents } from "./authentication";
import { addCommand } from "./commands";
import { initDb } from "./database";
import { initProfileEvents } from "./profiles";
import { initServer, server } from "./server";

addCommand("stop", "Stops the server", () => {
  console.log("Stopping server");
  process.exit();
});

function main() {
  initServer();
  initDb();
  server.onSocketOpen((socket) => {
    socket.on("Ping", (_, __) => socket.send("Pong", {}));
    initAuthenticationEvents(socket);
    initProfileEvents(socket);
  });
  Socket.LogEvents = process.env.NODE_ENV !== "production";
}
main();
