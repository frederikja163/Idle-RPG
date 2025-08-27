import { CleanupEventDispatcher } from '@/backend/core/events/cleanup-dispatcher';
import { injectableSingleton } from '@/backend/core/lib/lib-tsyringe';
import { PageToken, type Page } from '@/backend/core/server/page';
import { Server } from '@/backend/core/server/server';
import { SocketRegistry } from '@/backend/core/server/sockets/socket-registry';

@injectableSingleton(PageToken)
export class Stop implements Page<'/stop'> {
  constructor(
    private readonly server: Server,
    private readonly socketRegistry: SocketRegistry,
    private readonly cleanupDispatcher: CleanupEventDispatcher,
  ) {}

  get route(): '/stop' {
    return '/stop';
  }
  get handler(): Bun.RouterTypes.RouteValue<'/stop'> {
    return {
      POST: this.post.bind(this),
    };
  }

  private async post(req: Bun.BunRequest<'/stop'>): Promise<Response> {
    const json = await req.json();

    if (process.env.ADMIN_PASSWORD !== json['password']) {
      return new Response('Unauthorized', { status: 401 });
    }
    const reason = json['reason'] ?? 'Scheduled maintenance';
    const minutes = json['time'] ?? 10;
    if (typeof reason !== 'string' || typeof minutes !== 'number') {
      return new Response('Bad Request', { status: 400 });
    }

    console.log('Stopping new connections.');
    this.server.stop();

    console.log('Broadcasting shutdown.');
    const time = new Date();
    time.setMinutes(time.getMinutes() + minutes);

    this.socketRegistry.getAllSockets().forEach((s) => s.send('Connection/Shutdown', { reason, time }));

    console.log(`Shutting down in ${minutes} minutes.`);
    setTimeout(
      () => {
        console.log('Running final cleanup');
        this.cleanupDispatcher.cleanup();
        this.socketRegistry.getAllSockets().forEach((s) => s.send('Connection/Shutdown', { reason, time }));
        console.log('Shut down.');
        process.exit(0);
      },
      minutes * 60 * 1000,
    );

    return new Response('OK', { status: 200 });
  }
}
