import 'reflect-metadata';
import './container';
import { container } from 'tsyringe';
import { Server } from './core/server/server';
import { Socket } from '@/shared/socket/socket';
import { CleanupEventDispatcher } from './core/events/cleanup-dispatcher';

function main() {
  const debug = process.env.NODE_ENV !== 'production';
  Socket.LogEvents = debug;

  const server = container.resolve(Server);
  server.start();

  const cleanup = container.resolve(CleanupEventDispatcher);
  cleanup.start(debug || true ? 5 * 1000 : 5 * 60 * 1000);
}

main();
