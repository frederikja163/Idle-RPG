import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/frontend/providers/auth-provider';
import { Column } from '@/frontend/components/ui/layout/column';
import React, { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/frontend/router/routes';

export const Login: FC = React.memo(function Login() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate(routes.profiles);
    }
  }, [isLoggedIn, navigate]);

  return (
    <Column className="justify-center items-center p-6">
      <h1>Idle RPG login page</h1>
      {login ? <GoogleLogin onSuccess={login} /> : <p>Establishing connection.</p>}
    </Column>
  );
});
