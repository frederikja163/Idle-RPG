import {GoogleLogin} from '@react-oauth/google';
import {useAuth} from '@/front-end/providers/auth-provider.tsx';
import {useContext, useEffect} from 'react';
import {SocketContext} from '@/front-end/App.tsx';
import {useNavigate} from 'react-router-dom';

export function Login() {
	const socket = useContext(SocketContext);
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
		<>
			<h1>Idle RPG</h1>
			{login ? (
				<GoogleLogin onSuccess={login}/>
			) : (
				<p>Establishing connection.</p>
			)}
		</>
	);
}
