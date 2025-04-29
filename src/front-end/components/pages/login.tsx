import {GoogleLogin} from '@react-oauth/google';
import {useAuth} from '@/front-end/state/auth-provider.tsx';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Column} from '@/front-end/components/layout/column.tsx';
import {useSocket} from '@/front-end/state/socket-provider.tsx';

export function Login() {
  const socket = useSocket();
  const navigate = useNavigate();
  const {login} = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on('Authentication/LoginSuccess', (s, d) => {
      navigate('/profiles');
    });

    socket.on('Authentication/LogoutSuccess', (s, d) => {
      navigate('/login');
    });
  }, [socket]);

  return (
    <Column className="justify-center items-center p-6">
      <h1>Idle RPG login page</h1>
      {login ? (
        <GoogleLogin onSuccess={login}/>
      ) : (
        <p>Establishing connection.</p>
      )}
    </Column>
  );
}
