import '@/shared/definition/definitions';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/frontend/providers/auth-provider';
import { AppRouter } from '@/frontend/router/app-router';
import { SocketProvider } from '@/frontend/providers/socket-provider';
import { useAtomsDevtools } from 'jotai-devtools';
import { ToastProvider } from '@/frontend/providers/toast-provider';
import React from 'react';

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
