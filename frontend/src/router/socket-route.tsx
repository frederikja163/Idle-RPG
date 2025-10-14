import React, { type FC, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { routes } from '@/frontend/router/routes';
import { useSocket } from '@/frontend/providers/socket-provider';

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

  return <Outlet />;
});
