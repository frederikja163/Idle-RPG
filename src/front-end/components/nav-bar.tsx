import {useCallback, useContext} from 'react';
import {SocketContext} from '../App';
import {Button} from './ui/button.tsx';
import {useAuth} from '@/front-end/providers/auth-provider.tsx';
import {Row} from '@/front-end/components/layout/row.tsx';
import {Text} from '@/front-end/components/ui/text.tsx';
import {useNavigate} from 'react-router-dom';
import {routes} from '@/front-end/router/routes.ts';

export function NavBar() {
	const socket = useContext(SocketContext);
	const navigate = useNavigate();
	const {isLoggedIn} = useAuth();

	const navigateToTest = useCallback(() => {
		navigate(routes.test);
	}, [navigate]);

	const navigateToGame = useCallback(() => {
		navigate(routes.game);
	}, [navigate]);

	const navigateToProfiles = useCallback(() => {
		navigate(routes.profiles);
	}, [navigate]);

	const navigateToLogin = useCallback(() => {
		navigate(routes.login);
	}, [navigate]);

	return (
		<Row className="bg-green-100 justify-between p-4">
			<Text className="text-2xl">
				Idle-RPG
			</Text>
			<Row className="gap-4">
				{import.meta.hot && <Button onClick={navigateToTest}>
                    <Text>Test</Text>
                </Button>}
				{isLoggedIn && <>
                    <Button onClick={navigateToGame}>
                        <Text>Game</Text>
                    </Button>
                    <Button onClick={navigateToProfiles}>
                        <Text>Profiles</Text>
                    </Button>
                </>}
				{isLoggedIn ? (
					<Button onClick={() => socket?.send('Authentication/Logout', {})}>
						Log out
					</Button>
				) : (
					<Button onClick={navigateToLogin}>
						<Text>Login</Text>
					</Button>
				)}

			</Row>
		</Row>
	);
}
