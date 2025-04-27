import React, {type FC, type HTMLProps} from 'react';

export const Text: FC<HTMLProps<HTMLParagraphElement>> = React.memo((props) => {
	const {children} = props;

	return <p {...props}>{children}</p>;
});