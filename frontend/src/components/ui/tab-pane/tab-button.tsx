import React, { type FC, type ReactNode, useCallback } from 'react';
import { Typography } from '@/frontend/components/ui/typography';
import { Column } from '@/frontend/components/ui/layout/column';
import { nameOf } from '@/frontend/lib/function-utils';

interface Props {
  index: number;
  selectedIndex: number;
  orientation: 'vertical' | 'horizontal';
  label?: string;
  children?: ReactNode;

  onClick(index: number): void;
}

export const TabButton: FC<Props> = React.memo((props) => {
  const { index, selectedIndex, orientation, label, children, onClick } = props;

  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  // TODO: jeg kom til at fikse den border her under
  return (
    <button
      onClick={handleClick}
      style={{ marginRight: '-1px' }}
      className={`p-2 cursor-pointer border-2 border-solid border-transparent hover:text-secondary ${selectedIndex === index && `text-primary border-${orientation === 'vertical' ? 'r' : 'b'}-primary`}`}>
      <Column>
        {label && <Typography>{label}</Typography>}
        {children}
      </Column>
    </button>
  );
});

TabButton.displayName = nameOf({ TabButton });
