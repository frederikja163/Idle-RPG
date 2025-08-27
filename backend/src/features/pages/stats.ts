import { injectableSingleton } from '@/backend/core/lib/lib-tsyringe';
import { PageToken, type Page } from '@/backend/core/server/page';
import { Server } from '@/backend/core/server/server';
import { SocketSessionStore } from '@/backend/core/server/sockets/socket-session-store';

@injectableSingleton(PageToken)
export class Stats implements Page<'/stats'> {
  constructor(
    private readonly sessionStore: SocketSessionStore,
    private readonly server: Server,
  ) {}

  get route(): '/stats' {
    return '/stats';
  }
  get handler(): Bun.RouterTypes.RouteValue<'/stats'> {
    return (_) =>
      new Response(
        JSON.stringify({
          socketCount: this.sessionStore.socketCount,
          userCount: this.sessionStore.userCount,
          profileCount: this.sessionStore.profileCount,
          startTime: this.server.startTime.toUTCString(),
          uptime: formatTimeAsString(new Date().getTime() - this.server.startTime.getTime()),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
  }
}

function formatTimeAsString(ms: number) {
  const totalSeconds = ms / 1000;
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  return `${days} ${hours}:${minutes}:${seconds}`;
}
