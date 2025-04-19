import index from "@/front-end/index.html";
import { serverSocket, type ServerSocket } from "@/shared/events";
import type { ServerWebSocket } from "bun";

const sockets = new Map<ServerWebSocket<unknown>, ServerSocket>();

const server = Bun.serve({
  routes: {
    "/*": index,
  },
  fetch(request, server) {
    if (server.upgrade(request)) {
      return;
    }
    return new Response("Failed to upgrade websocket", { status: 400 });
  },
  websocket: {
    open(ws) {
      const socket = serverSocket(ws);
      sockets.set(ws, socket);
      socket.on("Ping", () => socket.send("Pong", {}));
    },
    message(ws, message) {
      const socket = sockets.get(ws);
      socket.handleMessage(String(message));
    },
    close(ws, code, reason) {
      sockets.delete(ws);
    },
  },
  development: process.env.NODE_ENV !== "production",
});

console.log(`Server running at ${server.url}`);
