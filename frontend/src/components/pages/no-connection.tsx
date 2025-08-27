import React, { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/frontend/router/routes';
import { useSocket } from '@/frontend/providers/socket-provider';
import { Typography } from '@/frontend/components/ui/typography';
import { Column } from '@/frontend/components/ui/layout/column';
import { Row } from '@/frontend/components/ui/layout/row';

export const NoConnection: FC = React.memo(function NoConnection() {
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    navigate(routes.login);
  }, [navigate, socket]);

  return (
    <Column className="p-8 gap-8 items-center">
      <Typography className="text-2xl">No connection to server</Typography>
      <Typography>
        Either an update is in progress or an error has occurred. Check the Discord for more info or report an issue on
        GitHub.
      </Typography>
      <Row className="gap-8 text-blue-600">
        <a href="https://discord.gg/vJhkD4RvNF">Discord</a>
        <a href="https://github.com/frederikja163/Idle-RPG">GitHub</a>
      </Row>
    </Column>
  );
});
