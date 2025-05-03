import index from '@/front-end/index.html';
import { file, serve, type ServerWebSocket } from 'bun';
import { injectable, singleton } from 'tsyringe';
import type { ISocketHandler } from './sockets/socket.ihandler';
import { ServerSocket } from './sockets/server.socket';
import { SessionStore } from './session/session.store';

@injectable()
@singleton()
export class Server {
  private readonly _eventHandlers: ISocketHandler[] = [];
  private readonly _sockets = new Map<ServerWebSocket<unknown>, ServerSocket>();
  private _server?: Bun.Server;

  constructor(private readonly sessionStore: SessionStore) {}

  public addSocketHandler(handler: ISocketHandler) {
    this._eventHandlers.push(handler);
  }

  public start() {
    if (this._server) this._server.stop();

    this._server = serve({
      port: process.env.PORT,
      routes: {
        '/*': index,
      },
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
    console.log(`Server running at: ${this._server.url}`);
  }

  private fetch(request: Request, server: Bun.Server) {
    if (server.upgrade(request)) {
      return;
    }
    return new Response('Failed to upgrade websocket', { status: 400 });
  }

  private socketOpen(ws: ServerWebSocket) {
    const socket = new ServerSocket(ws);
    this._sockets.set(ws, socket);
    for (const eventHandler of this._eventHandlers) {
      eventHandler.handleSocketOpen(socket);
    }
  }

  private socketMessage(ws: ServerWebSocket, message: string | Buffer<ArrayBufferLike>) {
    const socket = this._sockets.get(ws);
    const string = String(message);
    socket?.handleMessage(string);
  }

  private socketClose(ws: ServerWebSocket, code: number, reason: string) {
    const socket = this._sockets.get(ws);
    if (socket) this.sessionStore.close(socket?.id);
    this._sockets.delete(ws);
  }
}
