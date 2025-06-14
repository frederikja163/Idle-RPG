import React, { createContext, type FC, useContext, useEffect, useState } from 'react';
import { Socket } from '@/shared/socket/socket.ts';
import { clientServerEvent, serverClientEvent } from '@/shared/socket/socket-events';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import type {
  ClientEvent,
  ClientServerEvent,
  DataType,
  ServerClientEvent,
  ServerEvent,
  SocketId,
} from '@/shared/socket/socket-types.ts';
import type { ProviderProps } from '@/front-end/lib/types.ts';

const SocketContext = createContext<ClientSocket | null>(null);
export const useSocket = () => useContext(SocketContext);

export const useSendSocket = <TEvent extends ServerEvent>(
  event: TEvent,
  data: DataType<ClientServerEvent, TEvent>,
  skip: boolean = false,
) => {
  const socket = useSocket();

  useEffect(() => {
    if (skip) return;

    socket?.send(event, data);
  }, [data, event, skip, socket]);
};

export const useOnSocket = <TEvent extends ClientEvent>(
  type: TEvent,
  callback: (socketId: SocketId, data: DataType<ServerClientEvent, TEvent>) => void,
  skip: boolean = false,
) => {
  const socket = useSocket();

  useEffect(() => {
    if (skip) return;

    socket?.on(type, callback);
  }, [callback, skip, socket, type]);
};

type ClientSocket = Socket<typeof serverClientEvent, typeof clientServerEvent>;

async function clientSocket(ws: WebSocket) {
  await new Promise<void>((resolve) => {
    if (ws.readyState == ws.OPEN) {
      resolve();
    } else {
      ws.addEventListener('open', () => resolve(), { once: true });
    }
  });
  const socket = new Socket<typeof serverClientEvent, typeof clientServerEvent>(
    TypeCompiler.Compile(serverClientEvent),
    ws.send.bind(ws),
  );
  ws.addEventListener('message', (ev) => socket.handleMessage(ev.data));
  return socket;
}

export const SocketProvider: FC<ProviderProps> = React.memo(function SocketProvider(props) {
  const { children } = props;

  const [socket, setSocket] = useState<ClientSocket | null>(null);

  useEffect(() => {
    if (socket) return;

    const url = import.meta.env.VITE_BACKEND_URL;

    if (!url) {
      console.warn('No backend url, you should add it to .env');
      return;
    }

    const ws = new WebSocket(url);
    clientSocket(ws).then(setSocket);
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
});
