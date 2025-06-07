import React, { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/front-end/router/routes.ts';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';

export const NoConnection: FC = React.memo(function NoConnection() {
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    navigate(routes.login);
  }, [navigate, socket]);

  return (
    <Column className="p-8">
      <Typography className="text-center text-2xl">No connection to server</Typography>
    </Column>
  );
});
