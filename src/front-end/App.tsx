import '@/shared/definition/definitions';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/front-end/state/auth-provider.tsx';
import { AppRouter } from '@/front-end/router/app-router.tsx';
import { SocketProvider } from '@/front-end/state/socket-provider.tsx';
import { useAtomsDevtools } from 'jotai-devtools';

export function App() {
  useAtomsDevtools('Idle-RPG');

  return (
    <SocketProvider>
      <AuthProvider>
        <RouterProvider router={AppRouter} />
      </AuthProvider>
    </SocketProvider>
  );
}
