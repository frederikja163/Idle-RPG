import React, { type FC, type ReactNode } from 'react';
import { HoverCard } from 'radix-ui';
import { nameOf } from '@/frontend/lib/function-utils';

interface Props {
  children: ReactNode | ReactNode[];
  hoverContent: ReactNode;
  openDelay?: number;
  isDisabled?: boolean;
}

export const BasicHoverCard: FC<Props> = React.memo((props) => {
  const { children, hoverContent, openDelay = 100, isDisabled = false } = props;

  if (isDisabled) return children;

  return (
    <HoverCard.Root openDelay={openDelay}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content>{hoverContent}</HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
});

BasicHoverCard.displayName = nameOf({ BasicHoverCard });
