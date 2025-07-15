import { file, serve, type ServerWebSocket } from 'bun';
import { ServerSocket } from './sockets/server-socket';
import { SocketEventDispatcher } from '../events/socket-dispatcher';
import { SocketRegistry } from './sockets/socket-registry';
import { injectableSingleton } from '../lib/lib-tsyringe';
import type { SocketId } from '@/shared/socket/socket-types';
import { CleanupEventDispatcher } from '../events/cleanup-dispatcher';
import { PageToken, type Page } from './page';
import { injectAll } from 'tsyringe';

@injectableSingleton()
export class Server {
  private readonly sockets = new Map<ServerWebSocket, SocketId>();
  private server?: Bun.Server;

  constructor(
    @injectAll(PageToken) private readonly pages: Page<string>[],
    private readonly socketRegistry: SocketRegistry,
    private readonly socketDispatcher: SocketEventDispatcher,
    private readonly cleanupDispatcher: CleanupEventDispatcher,
  ) {}

  public start() {
    if (this.server) this.server.stop();

    const routes: Record<string, Bun.RouterTypes.RouteValue<string>> = {};
    for (const page of this.pages) {
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
    console.log('Stopping new connections.');
    this.server?.stop();

    console.log('Broadcasting shutdown.');
    const time = new Date();
    time.setMinutes(time.getMinutes() + 10);

    this.socketRegistry
      .getAllSockets()
      .forEach((s) => s.send('Connection/Shutdown', { reason: 'Scheduled maintenance.', time }));

    console.log('Shutting down in 10 minutes.');
    setTimeout(
      () => {
        console.log('Running final cleanup');
        this.cleanupDispatcher.cleanup();
        console.log('Shut down.');
        process.exit(0);
      },
      10 * 60 * 1000,
    );
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
