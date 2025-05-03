import 'reflect-metadata';
import { container } from 'tsyringe';
import { Server } from './core/server';
import { AuthSocketHandler } from './features/auth/auth.socket';
import { AuthGoogleSocketHandler } from './features/auth/auth.socket.google';
import { ProfileSocketHandler } from './features/profile/profile.socket';
import { Socket } from '@/shared/socket';
import { SocketCache } from './core/sockets/socket.cache';
import { UserCache } from './features/user/user.cache';
import type { ICache } from './core/cache';
import { ProfileCache } from './features/profile/profile.cache';
import { db } from './core/db/db';
import { CacheCleanup } from './core/cleanup';

function main() {
  const debug = process.env.NODE_ENV !== 'production';
  Socket.LogEvents = debug;

  const server = container.resolve(Server);
  server.addSocketHandler(container.resolve(AuthSocketHandler));
  server.addSocketHandler(container.resolve(AuthGoogleSocketHandler));
  server.addSocketHandler(container.resolve(ProfileSocketHandler));
  server.start();

  const cleanup = container.resolve(CacheCleanup);
  cleanup.start(debug ? 5 * 1000 : 5 * 60 * 1000);
}

main();
