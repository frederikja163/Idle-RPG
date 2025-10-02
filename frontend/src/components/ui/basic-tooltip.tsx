import React, { type FC, type ReactNode, useMemo } from 'react';
import { Tooltip } from 'radix-ui';
import { Card } from '@/frontend/components/ui/card';

interface Props {
  children: ReactNode | ReactNode[];
  tooltipContent: ReactNode | string;
  delayDuration?: number;
  disableHoverableContent?: boolean;
  isDisabled?: boolean;
}

export const BasicTooltip: FC<Props> = React.memo(function BasicTooltip(props) {
  const { children, tooltipContent, delayDuration = 100, disableHoverableContent, isDisabled = false } = props;

  const textCard = useMemo(() => <Card className="p-2">{tooltipContent}</Card>, [tooltipContent]);

  if (isDisabled) return children;

  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={delayDuration} disableHoverableContent={disableHoverableContent}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>{typeof tooltipContent === 'string' ? textCard : tooltipContent}</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
});
