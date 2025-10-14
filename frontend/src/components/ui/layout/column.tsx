import React, { type FC, type HTMLProps } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';

export const Column: FC<HTMLProps<HTMLDivElement>> = React.memo((props) => {
  const { children, className } = props;

  return (
    <div {...props} className={'flex flex-col ' + className}>
      {children}
    </div>
  );
});

Column.displayName = nameOf({ Column });