import React, { type FC, type HTMLProps } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';

export const Grid: FC<HTMLProps<HTMLDivElement>> = React.memo((props) => {
  const { children, className } = props;

  return (
    <div {...props} className={'grid ' + className}>
      {children}
    </div>
  );
});

Grid.displayName = nameOf({ Grid });
