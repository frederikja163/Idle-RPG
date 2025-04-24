import React, {type FC} from 'react';
import {Modal} from '@/front-end/components/ui/modal.tsx';

interface Props {
	isOpen: boolean;
}

export const ProfileCreator: FC<Props> = React.memo((props) => {
	const {isOpen} = props;

	return <Modal isOpen={isOpen}>
		<div className="bg-white">PC</div>
	</Modal>;
});
