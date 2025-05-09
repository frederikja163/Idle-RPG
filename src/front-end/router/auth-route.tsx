﻿import React, {type FC, useEffect} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {useAuth} from '@/front-end/state/auth-provider.tsx';
import {routes} from '@/front-end/router/routes.ts';

export const AuthRoute: FC = React.memo(() => {
  const {isLoggedIn} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(routes.login);
    }
  }, []);

  return <Outlet/>;
});