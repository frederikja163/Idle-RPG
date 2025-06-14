import { useCallback } from 'react';
import { Button } from './ui/button.tsx';
import { useAuth } from '@/front-end/state/providers/auth-provider.tsx';
import { Row } from '@/front-end/components/layout/row.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/front-end/router/routes.ts';
import { useSocket } from '@/front-end/state/providers/socket-provider.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Divider } from '@/front-end/components/ui/divider.tsx';
import { Banner } from '@/front-end/components/banner.tsx';

export function NavBar() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const navigateToTest = useCallback(() => {
    navigate(routes.test);
  }, [navigate]);

  const navigateToGame = useCallback(() => {
    navigate(routes.game);
  }, [navigate]);

  const navigateToProfiles = useCallback(() => {
    navigate(routes.profiles);
  }, [navigate]);

  const navigateToLogin = useCallback(() => {
    navigate(routes.login);
  }, [navigate]);

  return (
    <Column>
      <Banner />
      <Row className="justify-between p-4">
        <Typography className="text-2xl">Idle-RPG</Typography>
        <Row className="gap-4">
          {import.meta.hot && (
            <Button onClick={navigateToTest}>
              <Typography>Test</Typography>
            </Button>
          )}
          {isLoggedIn && (
            <>
              <Button onClick={navigateToGame}>
                <Typography>Game</Typography>
              </Button>
              <Button onClick={navigateToProfiles}>
                <Typography>Profiles</Typography>
              </Button>
            </>
          )}
          {isLoggedIn ? (
            <Button onClick={() => socket?.send('User/Logout', {})}>Log out</Button>
          ) : (
            <Button onClick={navigateToLogin}>
              <Typography>Login</Typography>
            </Button>
          )}
        </Row>
      </Row>
      <Divider />
    </Column>
  );
}
