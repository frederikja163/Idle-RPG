import 'reflect-metadata';
import './container';
import { container } from 'tsyringe';
import { Server } from './core/server/server';
import { Socket } from '@/shared/socket/socket';
import { CleanupEventDispatcher } from './core/events/cleanup-dispatcher';
import { SocketRegistry } from './core/server/sockets/socket-registry';

function main() {
  const debug = process.env.NODE_ENV !== 'production';
  Socket.LogEvents = debug;
  console.log('Process ID: ', process.pid);

  const server = container.resolve(Server);
  server.start();

  const cleanup = container.resolve(CleanupEventDispatcher);
  cleanup.start(debug ? 5 * 1000 : 5 * 60 * 1000);
}

function shutdown() {
  const server = container.resolve(Server);
  console.log('Stopping new connections.');
  server.stop();

  console.log('Broadcasting shutdown.');
  const time = new Date();
  time.setMinutes(time.getMinutes() + 10);

  const socketRegistry = container.resolve(SocketRegistry);
  socketRegistry.getAllSockets().forEach((s) => s.send('System/Shutdown', { reason: 'Scheduled maintenance.', time }));

  console.log('Shutting down in 10 minutes.');
  setTimeout(
    () => {
      console.log('Running final cleanup');
      const cleanup = container.resolve(CleanupEventDispatcher);
      cleanup.cleanup();
      console.log('Shut down.');
      process.exit(0);
    },
    10 * 60 * 1000,
  );
}

process.on('SIGINT', () => {
  shutdown();
});
main();
