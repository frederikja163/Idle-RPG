import React, { type FC, type HTMLProps } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';

interface Props extends HTMLProps<HTMLParagraphElement> {
  noWrap?: boolean;
}

export const Typography: FC<Props> = React.memo((props) => {
  const { children, className, noWrap, ...paragraphProps } = props;

  return (
    <p {...paragraphProps} className={`${noWrap ? 'text-nowrap overflow-hidden overflow-ellipsis' : ''} ${className}`}>
      {children}
    </p>
  );
});

Typography.displayName = nameOf({ Typography });
