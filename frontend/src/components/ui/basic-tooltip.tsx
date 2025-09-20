import React, { type FC, type ReactNode } from 'react';
import { Tooltip } from 'radix-ui';

interface Props {
  children: ReactNode | ReactNode[];
  tooltipContent: ReactNode;
  delayDuration?: number;
  disableHoverableContent?: boolean;
  isDisabled?: boolean;
}

export const BasicTooltip: FC<Props> = React.memo(function BasicTooltip(props) {
  const { children, tooltipContent, delayDuration = 100, disableHoverableContent, isDisabled = false } = props;

  if (isDisabled) return children;

  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={delayDuration} disableHoverableContent={disableHoverableContent}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>{tooltipContent}</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
});
