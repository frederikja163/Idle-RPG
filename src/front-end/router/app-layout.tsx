import React, {type FC} from 'react';
import {Outlet} from 'react-router-dom';
import {NavBar} from '@/front-end/components/nav-bar.tsx';
import {Column} from '@/front-end/components/layout/column.tsx';

export const AppLayout: FC = React.memo(() => {
	return (
		<Column>
			<NavBar/>
			<Outlet/>
		</Column>);
});