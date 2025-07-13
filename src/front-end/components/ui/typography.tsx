import React, { type FC, type HTMLProps } from 'react';

interface Props extends HTMLProps<HTMLParagraphElement> {
  noWrap?: boolean;
}

export const Typography: FC<Props> = React.memo(function Typography(props) {
  const { children, className, noWrap } = props;

  return (
    <p {...props} className={`${noWrap ? 'text-nowrap overflow-hidden overflow-ellipsis' : ''} ${className}`}>
      {children}
    </p>
  );
});
