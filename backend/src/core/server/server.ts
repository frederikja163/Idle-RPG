import { file, serve, type ServerWebSocket } from 'bun';
import { ServerSocket } from './sockets/server-socket';
import { SocketEventDispatcher } from '../events/socket-dispatcher';
import { SocketRegistry } from './sockets/socket-registry';
import { injectableSingleton, resolveAll } from '../lib/lib-tsyringe';
import type { SocketId } from '@/shared/socket/socket-types';
import { PageToken } from './page';

@injectableSingleton()
export class Server {
  private readonly sockets = new Map<ServerWebSocket, SocketId>();
  private server?: Bun.Server;
  private _startTime?: Date;

  constructor(
    private readonly socketRegistry: SocketRegistry,
    private readonly socketDispatcher: SocketEventDispatcher,
  ) {}

  public get startTime(): Date {
    if (!this._startTime) {
      throw new Error('Must start server to have start time.');
    }
    return this._startTime;
  }

  public start() {
    if (this.server) return;

    this._startTime = new Date();

    const routes: Record<string, Bun.RouterTypes.RouteValue<string>> = {};
    const pages = resolveAll(PageToken);
    for (const page of pages) {
      routes[page.route] = page.handler;
    }

    this.server = serve({
      port: process.env.PORT,
      routes,
      fetch: this.fetch,
      websocket: {
        open: this.socketOpen.bind(this),
        message: this.socketMessage.bind(this),
        close: this.socketClose.bind(this),
      },
      development: process.env.NODE_ENV !== 'production',
      tls: {
        cert: process.env.TLS_CERT_PATH ? file(process.env.TLS_CERT_PATH) : undefined,
        key: process.env.TLS_KEY_PATH ? file(process.env.TLS_KEY_PATH) : undefined,
      },
    });
    console.log(`Server running at: ${this.server.url}`);
  }

  public stop() {
    this.server?.stop();
  }

  private fetch(request: Request, server: Bun.Server) {
    if (server.upgrade(request)) {
      return;
    }
    return new Response('Failed to upgrade websocket', { status: 400 });
  }

  private socketOpen(ws: ServerWebSocket) {
    const socket = new ServerSocket(ws);
    this.sockets.set(ws, socket.id);
    this.socketRegistry.addSocket(socket);
    this.socketDispatcher.emitSocketOpen({ socketId: socket.id });
  }

  private socketMessage(ws: ServerWebSocket, message: string | Buffer<ArrayBufferLike>) {
    const socketId = this.sockets.get(ws)!;
    const socket = this.socketRegistry.getSocket(socketId);
    const string = String(message);
    socket?.handleMessage(string);
  }

  private socketClose(ws: ServerWebSocket, code: number, reason: string) {
    const socketId = this.sockets.get(ws)!;
    this.sockets.delete(ws);
    this.socketDispatcher.emitSocketClose({ socketId, code, reason });
    this.socketRegistry.removeSocket(socketId);
  }
}
