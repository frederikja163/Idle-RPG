import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/frontend/providers/auth-provider';
import { Column } from '@/frontend/components/ui/layout/column';
import React, { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/frontend/router/routes';
import { Typography } from '@/frontend/components/ui/typography';
import { Divider } from '@/frontend/components/ui/layout/divider';
import { Row } from '@/frontend/components/ui/layout/row';
import { DiscordLinkIcon } from '@/frontend/components/common/link-icons/discord-link-icon';
import { GithubLinkIcon } from '@/frontend/components/common/link-icons/github-link-icon';

export const Login: FC = React.memo(function Login() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate(routes.profiles);
    }
  }, [isLoggedIn, navigate]);

  return (
    <Column className="h-screen justify-between items-center p-20 gap-6">
      <Typography className="text-5xl">Idle RPG</Typography>
      <Column className="items-center mb-[25%]">
        <Typography className="text-4xl text-primary">Welcome</Typography>
        <Typography className="text-sm text-gray-400 mb-6">Login</Typography>
        {login ? <GoogleLogin onSuccess={login} /> : <Typography>Establishing connection.</Typography>}
      </Column>
      <Column className="w-full gap-6">
        <Divider />
        <Row className="justify-center gap-6">
          <DiscordLinkIcon size={60} />
          <GithubLinkIcon size={60} />
        </Row>
      </Column>
    </Column>
  );
});
