import React, {type FC, type ReactNode} from 'react';
import {createPortal} from 'react-dom';

interface Props {
	children: ReactNode | ReactNode[];
	isOpen: boolean;
}

export const Modal: FC<Props> = React.memo((props) => {
	const {children, isOpen} = props;

	if (!isOpen) return null;
	
	return createPortal(
		<div className="fixed inset-0 bg-black opacity-80 flex items-center justify-center z-50">
			<div className="relative">
				{children}
			</div>
		</div>, document.body);
});