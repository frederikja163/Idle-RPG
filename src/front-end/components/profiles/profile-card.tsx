import React, {type FC, useCallback} from 'react';
import {Column} from '@/front-end/components/layout/column.tsx';
import {Card} from '@/front-end/components/ui/card.tsx';
import type {ProfileDto} from '../pages/profiles';

interface Props {
	onClick(profile: ProfileDto | undefined): void;

	profile?: ProfileDto;
	isCreateNew?: boolean;
}

export const ProfileCard: FC<Props> = React.memo((props) => {
	const {onClick, profile, isCreateNew = false} = props;

	const handleClick = useCallback(() => {
		onClick(profile);
	}, [onClick, profile]);

	return (
		<Card className="bg-green-200 w-64 h-96 p-4" onClick={handleClick}>
			{isCreateNew ?
				<p className="text-center text-9xl leading-none w-full h-full">+</p> :
				<Column className="items-center">
					<p className="text-center text-lg">{profile?.name}</p>
				</Column>}
		</Card>);
});