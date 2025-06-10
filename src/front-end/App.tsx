import '@/shared/definition/definitions';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/front-end/state/auth-provider.tsx';
import { AppRouter } from '@/front-end/router/app-router.tsx';
import { SocketProvider } from '@/front-end/state/socket-provider.tsx';
import { useAtomsDevtools } from 'jotai-devtools';
import { ToastProvider } from '@/front-end/state/toast-provider.tsx';

export function App() {
  useAtomsDevtools('Idle-RPG');

  return (
    <ToastProvider>
      <SocketProvider>
        <AuthProvider>
          <RouterProvider router={AppRouter} />
        </AuthProvider>
      </SocketProvider>
    </ToastProvider>
  );
}
