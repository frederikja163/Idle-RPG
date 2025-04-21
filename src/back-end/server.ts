import index from "@/front-end/index.html";
import { serverSocket, type ServerSocket } from "@/shared/socket";
import type { ServerWebSocket } from "bun";

export type SocketEvent = (socket: ServerSocket) => void;
class Server {
  private readonly _openEvents: Set<SocketEvent>;
  private readonly _closeEvents: Set<SocketEvent>;
  private readonly _sockets: Map<ServerWebSocket<unknown>, ServerSocket>;
  private readonly _server: Bun.Server;

  constructor() {
    this._openEvents = new Set<SocketEvent>();
    this._closeEvents = new Set<SocketEvent>();
    this._sockets = new Map<ServerWebSocket<unknown>, ServerSocket>();
    this._server = Bun.serve({
      routes: {
        "/*": index,
      },
      fetch: this.fetch,
      websocket: {
        open: this.socketOpen.bind(this),
        message: this.socketMessage.bind(this),
        close: this.socketClose.bind(this),
      },
      development: process.env.NODE_ENV !== "production",
    });
    console.log(`Server running at: ${this._server.url}`);
  }

  private fetch(request: Request, server: Bun.Server) {
    if (server.upgrade(request)) {
      return;
    }
    return new Response("Failed to upgrade websocket", { status: 400 });
  }

  private socketOpen(ws: ServerWebSocket) {
    const socket = serverSocket(ws);
    this._sockets.set(ws, socket);
    this._openEvents.forEach((cb) => cb(socket));
  }

  private socketMessage(
    ws: ServerWebSocket,
    message: string | Buffer<ArrayBufferLike>
  ) {
    const socket = this._sockets.get(ws);
    if (socket) socket.handleMessage(String(message));
  }

  private socketClose(ws: ServerWebSocket, code: number, reason: string) {
    const socket = this._sockets.get(ws);
    if (socket) this._closeEvents.forEach((cb) => cb(socket));
    this._sockets.delete(ws);
  }

  public onSocketOpen(callback: SocketEvent) {
    this._sockets.forEach((s, _) => callback(s));
    this._openEvents.add(callback);
  }

  public onSocketClose(callback: SocketEvent) {
    this._closeEvents.add(callback);
  }
}

export const server = new Server();
