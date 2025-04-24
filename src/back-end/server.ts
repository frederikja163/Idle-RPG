import index from "@/front-end/index.html";
import { serve, type ServerWebSocket } from "bun";
import { type ServerSocket, serverSocket } from "./server-socket";

export type SocketEvent = (socket: ServerSocket) => void;
export type MessageEvent = (socket: ServerSocket, message: string) => void;
class Server {
  private readonly _openEvents: Set<SocketEvent>;
  private readonly _messageEvents: Set<MessageEvent>;
  private readonly _closeEvents: Set<SocketEvent>;
  private readonly _sockets: Map<ServerWebSocket<unknown>, ServerSocket>;
  private readonly _server: Bun.Server;

  constructor() {
    this._openEvents = new Set<SocketEvent>();
    this._messageEvents = new Set<MessageEvent>();
    this._closeEvents = new Set<SocketEvent>();
    this._sockets = new Map<ServerWebSocket<unknown>, ServerSocket>();
    this._server = serve({
      port: process.env.PORT,
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
    const string = String(message);
    if (socket) this._messageEvents.forEach((cb) => cb(socket, string));
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

  public onSocketMessage(callback: MessageEvent) {
    this._messageEvents.add(callback);
  }

  public onSocketClose(callback: SocketEvent) {
    this._closeEvents.add(callback);
  }
}
export const server = new Server();

export function initServer() {}
