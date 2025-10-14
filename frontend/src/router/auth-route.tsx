import React, { type FC, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/frontend/providers/auth-provider';
import { routes } from '@/frontend/router/routes';

export const AuthRoute: FC = React.memo(function AuthRoute() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(routes.login);
    }
  }, [isLoggedIn, navigate]);

  return <Outlet />;
});
