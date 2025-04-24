import React, {type FC, type HTMLAttributes} from 'react';

export const Row: FC<HTMLAttributes<HTMLDivElement>> = React.memo((props) => {
	const {children} = props;

	return <div className="flex flex-row" {...props} >{children}</div>;
});