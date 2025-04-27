import {createContext, useEffect, useState} from 'react';
import './index.css';
import {type ClientSocket, clientSocket} from './client-socket';
import {RouterProvider} from 'react-router-dom';
import {AuthProvider} from '@/front-end/providers/auth-provider.tsx';
import {AppRouter} from '@/front-end/router/app-router.tsx';

export const SocketContext = createContext<ClientSocket | null>(null);

export function App() {
	const [socket, setSocket] = useState<ClientSocket | null>(null);

	useEffect(() => {
		if (socket) return;
		const ws = new WebSocket(String(window.location));
		clientSocket(ws).then(setSocket);
	});

	return (
		<SocketContext.Provider value={socket}>
			<AuthProvider>
				<RouterProvider router={AppRouter}/>
			</AuthProvider>
		</SocketContext.Provider>
	);
}
