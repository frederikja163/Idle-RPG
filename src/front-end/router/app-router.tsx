import {createBrowserRouter} from 'react-router-dom';
import {AppLayout} from '@/front-end/router/app-layout.tsx';
import {AuthRoute} from '@/front-end/router/auth-route.tsx';
import {routes} from '@/front-end/router/routes.ts';
import {Login} from '@/front-end/components/pages/login.tsx';
import {Profiles} from '@/front-end/components/pages/profiles.tsx';
import {Test} from '@/front-end/components/pages/test.tsx';
import {Game} from '@/front-end/components/pages/game.tsx';

export const AppRouter = createBrowserRouter([
	{
		path: '/',
		element: <AppLayout/>,
		children: [
			{
				path: '',
				element: <Login/>,
			},
			{
				path: routes.login,
				element: <Login/>,
			},
			{
				path: routes.test,
				element: <Test/>,
			},
			{
				element: <AuthRoute/>,
				children: [
					{
						path: routes.profiles,
						element: <Profiles/>,
					},
					{
						path: routes.game,
						element: <Game/>,
					},
				],
			},
		],
	},
]);