import {Socket} from '@/shared/socket';
import {initAuthenticationEvents} from './authentication';
import {initDb} from './database';
import {initProfileEvents} from './profiles';
import {initServer, server} from './server';
import {initInventoryEvents} from './inventory';

function main() {
  initServer();
  initDb();
  server.onSocketOpen((socket) => {
    socket.on('Ping', (_, __) => socket.send('Pong', {}));
    initAuthenticationEvents(socket);
    initProfileEvents(socket);
    initInventoryEvents(socket);
  });
  Socket.LogEvents = process.env.NODE_ENV !== 'production';
}

main();
