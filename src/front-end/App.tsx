import '@/shared/definition/definitions';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/front-end/state/providers/auth-provider.tsx';
import { AppRouter } from '@/front-end/router/app-router.tsx';
import { SocketProvider } from '@/front-end/state/providers/socket-provider.tsx';
import { useAtomsDevtools } from 'jotai-devtools';
import { ToastProvider } from '@/front-end/state/providers/toast-provider.tsx';
import { VisibilityProvider } from '@/front-end/state/providers/visibility-provider.tsx';

export function App() {
  useAtomsDevtools('Idle-RPG');

  return (
    <ToastProvider>
      <SocketProvider>
        <AuthProvider>
          <VisibilityProvider>
            <RouterProvider router={AppRouter} />
          </VisibilityProvider>
        </AuthProvider>
      </SocketProvider>
    </ToastProvider>
  );
}
