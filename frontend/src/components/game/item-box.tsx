import React, { type FC, type ReactNode } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import { nameOf } from '@/frontend/lib/function-utils';

interface Props {
  background?: 'standard' | 'error';
  children: ReactNode | ReactNode[];
}

export const ItemBox: FC<Props> = React.memo((props) => {
  const { background = 'standard', children } = props;

  return (
    <Column
      className={`rounded min-w-16 w-16 h-16 p-1 select-none ${background === 'error' ? 'bg-red-300' : 'bg-gray-200'}`}>
      {children}
    </Column>
  );
});

ItemBox.displayName = nameOf({ ItemBox });
