import React, { createContext, type FC, useContext, useEffect, useState } from 'react';
import { Socket } from '@/shared/socket/socket';
import { clientServerEvent, serverClientEvent } from '@/shared/socket/socket-events';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import type {
  ClientEvent,
  ClientServerEvent,
  DataType,
  ServerClientEvent,
  ServerEvent,
  SocketId,
} from '@/shared/socket/socket-types';
import type { ProviderProps } from '@/frontend/types/provider-types';
import type { Timeout } from 'react-number-format/types/types';

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

function clientSocket(ws: WebSocket) {
  if (ws.readyState !== ws.OPEN) {
    throw new Error('WebSocket not open. Cannot create client socket.');
  }

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
    const url = import.meta.env.VITE_BACKEND_URL;
    if (!url) {
      console.warn('No backend url, you should add it to .env');
      return;
    }

    let retries = 0;
    let retryTimeout: Timeout | undefined;

    const connect = () => {
      const ws = new WebSocket(url);

      ws.addEventListener('open', () => {
        retries = 0;
        const cs = clientSocket(ws);
        setSocket(cs);
      });

      ws.addEventListener('close', () => {
        setSocket(null);

        retries++;
        const delayMs = 1000 * retries;

        console.warn(`Server connection lost. Attempting to reconnect in ${delayMs / 1000} seconds.`);

        retryTimeout = setTimeout(connect, delayMs);
      });
    };

    connect();

    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
});
