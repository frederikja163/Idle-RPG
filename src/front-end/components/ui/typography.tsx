import React, {type FC, type HTMLProps} from 'react';

export const Typography: FC<HTMLProps<HTMLParagraphElement>> = React.memo(function Typography(props) {
  const {children} = props;

  return <p {...props}>{children}</p>;
});