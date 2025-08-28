import React, { type FC, type ReactNode, useCallback } from 'react';
import { Typography } from '@/frontend/components/ui/typography';
import { Column } from '@/frontend/components/ui/layout/column';

interface Props {
  index: number;
  selectedIndex: number;
  label?: string;
  children?: ReactNode;

  onClick(index: number): void;
}

export const TabButton: FC<Props> = React.memo(function SideTabButton(props) {
  const { index, selectedIndex, label, children, onClick } = props;

  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  return (
    <button
      onClick={handleClick}
      style={{ marginRight: '-1px' }}
      className={`p-2 cursor-pointer border-2 border-solid border-transparent hover:text-secondary ${selectedIndex === index && 'text-primary border-r-primary'}`}>
      <Column>
        {label && <Typography>{label}</Typography>}
        {children}
      </Column>
    </button>
  );
});
