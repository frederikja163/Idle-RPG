import React, {type FC, type HTMLAttributes} from 'react';

export const Column: FC<HTMLAttributes<HTMLDivElement>> = React.memo((props) => {
	const {children} = props;

	return <div className="flex flex-col" {...props}>{children}</div>;
});