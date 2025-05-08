import {file, serve, type ServerWebSocket} from 'bun';
import {ServerSocket} from './sockets/server-socket';
import {SocketEventDispatcher} from '../events/socket-dispatcher';
import {SocketRegistry} from './sockets/socket-registry';
import type {SocketId} from './sockets/socket-types';
import {injectableSingleton} from '../lib/lib-tsyringe';

const forbiddenPathStrings = ['\\', '..', ':'];

@injectableSingleton()
export class Server {
  private readonly sockets = new Map<ServerWebSocket, SocketId>();
  private server?: Bun.Server;

  constructor(
    private readonly socketRegistry: SocketRegistry,
    private readonly socketDispatcher: SocketEventDispatcher,
  ) {
  }

  public start() {
    if (this.server) this.server.stop();

    this.server = serve({
      port: process.env.PORT,
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

  private hostAssets(request: Bun.BunRequest<'/assets/*.svg'>) {
    const url = request.url;
    const fileName = url.split('/assets/')[1];
    const path = `./src/front-end/assets/${fileName}`;

    for (const str of forbiddenPathStrings) {
      if (fileName.includes(str)) {
        return new Response('Bad request', {status: 400});
      }
    }

    return new Response(file(path), {headers: {'Content-Type': 'image/svg+xml'}});
  }

  private fetch(request: Request, server: Bun.Server) {
    if (server.upgrade(request)) {
      return;
    }
    return new Response('Failed to upgrade websocket', {status: 400});
  }

  private socketOpen(ws: ServerWebSocket) {
    const socket = new ServerSocket(ws);
    this.sockets.set(ws, socket.id);
    this.socketRegistry.addSocket(socket);
    this.socketDispatcher.emitSocketOpen({socketId: socket.id});
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
    this.socketDispatcher.emitSocketClose({socketId});
    this.socketRegistry.removeSocket(socketId);
  }
}
