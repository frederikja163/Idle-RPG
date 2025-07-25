﻿import { createHashRouter, Outlet, useNavigate } from 'react-router-dom';
import { AuthRoute } from '@/front-end/router/auth-route.tsx';
import { routes } from '@/front-end/router/routes.ts';
import { Login } from '@/front-end/components/pages/login.tsx';
import { Profiles } from '@/front-end/components/pages/profiles.tsx';
import { Test } from '@/front-end/components/pages/test.tsx';
import { Game } from '@/front-end/components/pages/game.tsx';
import { SocketFeatureProvider } from '@/front-end/providers/socket-feature-provider.tsx';
import { NoConnection } from '@/front-end/components/pages/no-connection.tsx';
import { SocketRoute } from '@/front-end/router/socket-route.tsx';
import { ResyncService } from '@/front-end/services/resync-service.tsx';
import { Error } from '@/front-end/components/pages/error.tsx';

// TODO: try to remove this by splitting up SocketFeatureProvider
// Needed to pass navigate to some providers
function AppProvidersWrapper() {
  const navigate = useNavigate();

  return (
    <SocketFeatureProvider navigate={navigate}>
      <>
        <ResyncService />
        <Outlet />
      </>
    </SocketFeatureProvider>
  );
}

export const AppRouter = createHashRouter([
  {
    path: '/',
    element: <AppProvidersWrapper />,
    errorElement: <Error />,
    children: [
      {
        element: <SocketRoute />,
        children: [
          {
            path: '',
            element: <Login />,
          },
          {
            path: routes.login,
            element: <Login />,
          },
          {
            path: routes.test,
            element: <Test />,
          },

          {
            element: <AuthRoute />,
            children: [
              {
                path: routes.profiles,
                element: <Profiles />,
              },
              {
                path: routes.game,
                element: <Game />,
              },
            ],
          },
        ],
      },
      {
        path: routes.noConnection,
        element: <NoConnection />,
      },
    ],
  },
]);
