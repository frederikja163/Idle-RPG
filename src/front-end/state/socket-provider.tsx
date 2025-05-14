import React, { createContext, type FC, type ReactNode, useContext, useEffect, useState } from 'react';
import { Socket } from '@/shared/socket/socket.ts';
import { clientServerEvent, serverClientEvent } from '@/shared/socket/socket-events';
import { TypeCompiler } from '@sinclair/typebox/compiler';

const SocketContext = createContext<ClientSocket | null>(null);
export const useSocket = () => useContext(SocketContext);

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

interface Props {
  children: ReactNode | ReactNode[];
}

export const SocketProvider: FC<Props> = React.memo(function SocketProvider(props) {
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
    clientSocket(ws).then(
      (s) => {
        setSocket(s);
        s.on('Error', (s, data) => s.onError(data.errorType, data.message));
      },
      [socket],
    );
  });

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
});
