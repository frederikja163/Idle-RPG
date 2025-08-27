import { createHashRouter, Outlet, useNavigate } from 'react-router-dom';
import { AuthRoute } from '@/frontend/router/auth-route';
import { routes } from '@/frontend/router/routes';
import { Login } from '@/frontend/components/pages/login';
import { Profiles } from '@/frontend/components/pages/profiles';
import { Test } from '@/frontend/components/pages/test';
import { Game } from '@/frontend/components/pages/game';
import { SocketFeatureProvider } from '@/frontend/providers/socket-feature-provider';
import { NoConnection } from '@/frontend/components/pages/no-connection';
import { SocketRoute } from '@/frontend/router/socket-route';
import { ResyncService } from '@/frontend/services/resync-service';
import { Error } from '@/frontend/components/pages/error';

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
