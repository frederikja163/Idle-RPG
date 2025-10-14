import React, { type FC, type HTMLProps } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';

export const Row: FC<HTMLProps<HTMLDivElement>> = React.memo((props) => {
  const { children, className } = props;

  return (
    <div {...props} className={'flex flex-row ' + className}>
      {children}
    </div>
  );
});

Row.displayName = nameOf({ Row });