import React, {type FC, type ReactNode} from 'react';
import {Tooltip} from 'radix-ui';

interface Props {
  children: ReactNode | ReactNode[];
  tooltipContent: ReactNode;
}

export const BasicTooltip: FC<Props> = React.memo((props) => {
  const {children, tooltipContent} = props;

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>
            {tooltipContent}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>);
});