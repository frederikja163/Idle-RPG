import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/front-end/providers/auth-provider.tsx';
import { useContext, useEffect } from 'react';
import { SocketContext } from '@/front-end/App.tsx';
import { useNavigate } from 'react-router-dom';
import { Column } from '@/front-end/components/layout/column.tsx';

export function Login() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on('Auth/LoginSuccess', (s, d) => {
      navigate('/profiles');
    });

    socket.on('Auth/LogoutSuccess', (s, d) => {
      navigate('/login');
    });
  }, [socket]);

  return (
    <Column className="justify-center items-center p-6">
      <h1>Idle RPG login page</h1>
      {login ? <GoogleLogin onSuccess={login} /> : <p>Establishing connection.</p>}
    </Column>
  );
}
