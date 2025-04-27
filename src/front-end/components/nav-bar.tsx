import {useContext} from 'react';
import {SocketContext} from '../App';
import {Button} from './ui/button.tsx';
import {useAuth} from '@/front-end/providers/auth-provider.tsx';
import {Row} from '@/front-end/components/layout/row.tsx';

export function NavBar() {
	const socket = useContext(SocketContext);
	const {isLoggedIn} = useAuth();

	return (
		<Row className="bg-blue-500">
			{isLoggedIn ? (
				<Button onClick={() => socket?.send('Authentication/Logout', {})}>
					Log out
				</Button>
			) : (
				<p>Go to home</p>
			)}
		</Row>
	);
}
