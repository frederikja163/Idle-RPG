import React, { type FC, type ReactNode, useCallback } from 'react';
import { Row } from '@/frontend/components/ui/layout/row';
import { nameOf } from '@/frontend/lib/function-utils';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const RoundButton: FC<Props> = React.memo((props) => {
  const { children, onClick, className } = props;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
      if (onClick) onClick();
    },
    [onClick],
  );

  return (
    <Row
      onClick={onClick ? handleClick : undefined}
      className={`bg-primary p-2 rounded-full w-10 aspect-square cursor-pointer shadow hover:bg-primary/60 ${className}`}>
      {children}
    </Row>
  );
});

RoundButton.displayName = nameOf({ RoundButton });
