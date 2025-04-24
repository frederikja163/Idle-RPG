import React, {type FC, useCallback, useContext, useState} from 'react';
import {Row} from '@/front-end/components/layout/row.tsx';
import {ProfileCard} from '@/front-end/components/profiles/profile-card.tsx';
import {SocketContext} from '@/front-end/App';
import {ProfileCreator} from '@/front-end/components/profiles/profile-creator.tsx';

export interface ProfileDto {
	name: string;
}

export const Profiles: FC = React.memo(() => {
	const socket = useContext(SocketContext);

	const [profiles, setProfiles] = useState<ProfileDto[]>([]);
	const [profileCreatorOpen, setProfileCreatorOpen] = useState(false);

	// useEffect(() => {
	// 	socket?.send("Profiles/GetProfiles", {});
	// 	socket?.on("Profiles/UpdateProfiles", (_, d) => {
	// 		setProfiles(d.profiles);
	// 	})
	// }, [socket]);

	const selectProfile = useCallback((profile: ProfileDto) => {

	}, []);

	const openProfileCreator = useCallback(() => {
		setProfileCreatorOpen(true);
	}, []);

	return (
		<Row>
			{profiles?.map(profile => <ProfileCard profile={profile} onClick={selectProfile}/>)}
			{profiles?.length < 10 && <ProfileCard isCreateNew onClick={openProfileCreator}/>}
			<ProfileCreator isOpen={profileCreatorOpen}/>
		</Row>);
});