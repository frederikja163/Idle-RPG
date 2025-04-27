import React, {type FC, useContext, useEffect, useState} from 'react';
import {Row} from '@/front-end/components/layout/row.tsx';
import {ProfileCard} from '@/front-end/components/profiles/profile-card.tsx';
import {SocketContext} from '@/front-end/App';
import {ProfileCreator} from '@/front-end/components/profiles/profile-creator.tsx';
import type {ProfileDto} from '@/shared/socket-events';

export const Profiles: FC = React.memo(() => {
	const socket = useContext(SocketContext);

	const [profiles, setProfiles] = useState<ProfileDto[]>([]);

	useEffect(() => {
		socket?.send('Profiles/GetProfiles', {});
		socket?.on('Profiles/UpdateProfiles', (_, d) => {
			setProfiles(d.profiles);
		});
	}, [socket]);

	return (
		<Row className="w-full justify-center flex-wrap gap-6 m-6">
			{profiles?.map((profile, i) =>
				<ProfileCard profileIndex={i} profile={profile}/>)}
			{profiles?.length < 10 && <ProfileCreator/>}
		</Row>);
});