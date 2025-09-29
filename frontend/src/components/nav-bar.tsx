import { useCallback } from 'react';
import { Button } from './ui/input/button';
import { useAuth } from '@/frontend/providers/auth-provider';
import { Row } from '@/frontend/components/ui/layout/row';
import { Typography } from '@/frontend/components/ui/typography';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/frontend/router/routes';
import { useSocket } from '@/frontend/providers/socket-provider';
import { Column } from '@/frontend/components/ui/layout/column';
import { Divider } from '@/frontend/components/ui/layout/divider';
import { Banner } from '@/frontend/components/banner';
import { Image } from '@/frontend/components/ui/image';
import { discordServerLink, githubRepoLink } from '@/frontend/constants/hyperlinks';
import { BasicTooltip } from '@/frontend/components/ui/basic-tooltip';

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
        <Row className="gap-4 items-center">
          <BasicTooltip tooltipContent="Join Discord server">
            <a
              href={discordServerLink}
              target="_blank"
              rel="noreferrer"
              className="aspect-square h-8 bg-blurple rounded-full shadow">
              <Image
                src={`${import.meta.env.VITE_BASE_URL}/assets/logos/Discord-Symbol-White.svg`}
                alt="Discord logo"
                className="p-[20%]" // Discord requires a margin 1/3 the width of the symbol
              />
            </a>
          </BasicTooltip>
          <BasicTooltip tooltipContent="Visit GitHub repo">
            <a href={githubRepoLink} target="_blank" rel="noreferrer" className="aspect-square h-8 rounded-full shadow">
              <Image src={`${import.meta.env.VITE_BASE_URL}/assets/logos/github-mark.svg`} alt="GitHub logo" />
            </a>
          </BasicTooltip>
          <Divider orientation="vertical" className="mx-4" />
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
