import { initServer, server } from './server';
import { Socket } from '@/shared/socket';
import { initAuthenticationEvents } from './api/authentication';
import { initDb } from './db/database';
import { initProfileEvents } from './api/profiles';
import { initInventoryEvents } from './api/inventory';
import { User } from './db/user';
import { Profile } from './db/profile';
import { Inventory } from './db/inventory';
import { initSocket } from './server-socket';

function main() {
  const debug = process.env.NODE_ENV !== 'production';
  initServer();
  initDb();
  initSocket();

  setInterval(
    async () => {
      await User.saveAll();
      await Profile.saveAll();
      await Inventory.saveAll();
    },
    debug ? 5 * 1000 : 5 * 60 * 1000,
  );

  server.onSocketOpen((socket) => {
    socket.on('Ping', (_, __) => socket.send('Pong', {}));
    initAuthenticationEvents(socket);
    initProfileEvents(socket);
    initInventoryEvents(socket);
  });
  Socket.LogEvents = debug;
}

main();
