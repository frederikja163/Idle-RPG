import React, { type FC, type ReactNode, useCallback, useMemo } from 'react';
import { Typography } from '@/frontend/components/ui/typography';
import { Column } from '@/frontend/components/ui/layout/column';
import { nameOf } from '@/frontend/lib/function-utils';
import { tabButtonCva } from '@/frontend/components/ui/tab-pane/styles';

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

  const buttonStyle = useMemo(
    () => tabButtonCva({ selected: selectedIndex === index, orientation }),
    [index, orientation, selectedIndex],
  );

  // TODO: jeg kom til at fikse den border her under
  return (
    <button onClick={handleClick} style={{ marginRight: '-1px' }} className={buttonStyle}>
      <Column>
        {label && <Typography>{label}</Typography>}
        {children}
      </Column>
    </button>
  );
});

TabButton.displayName = nameOf({ TabButton });
