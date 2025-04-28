import './index.css';
import {RouterProvider} from 'react-router-dom';
import {AuthProvider} from '@/front-end/providers/auth-provider.tsx';
import {AppRouter} from '@/front-end/router/app-router.tsx';
import {SocketProvider} from '@/front-end/providers/socket-provider.tsx';


export function App() {
  return (
    <SocketProvider>
      <AuthProvider>
        <RouterProvider router={AppRouter}/>
      </AuthProvider>
    </SocketProvider>
  );
}
