import React, { type FC, type ReactNode } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import { Typography } from '@/frontend/components/ui/typography';
import { nameOf } from '@/frontend/lib/function-utils';

interface Props {
  top: ReactNode | string;
  bottom: ReactNode | string;
}

export const RecipeCardSlot: FC<Props> = React.memo((props) => {
  const { top, bottom } = props;

  return (
    <Column className="w-full p-2 items-center">
      {typeof top === 'string' ? <Typography className="text-muted-foreground">{top}</Typography> : top}
      {typeof bottom === 'string' ? <Typography className="text-muted-foreground">{bottom}</Typography> : bottom}
    </Column>
  );
});

RecipeCardSlot.displayName = nameOf({ RecipeCardSlot });
