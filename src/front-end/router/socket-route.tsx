import React, { type FC, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/front-end/router/routes.ts';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { AppLayout } from '@/front-end/router/app-layout.tsx';

export const SocketRoute: FC = React.memo(function SocketRoute() {
  const navigate = useNavigate();
  const socket = useSocket();

  const socketRef = useRef(socket);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (socketRef.current) return;

    setTimeout(() => {
      if (socketRef.current) return;

      navigate(routes.noConnection);
    }, 2000);
    // eslint-disable-next-line
  }, [socket]);

  return <AppLayout />;
});
