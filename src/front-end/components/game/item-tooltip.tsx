﻿import React, { type FC } from 'react';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Row } from '@/front-end/components/layout/row.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { items } from '@/shared/definition/definition-items';

interface Props {
  itemId: string;
}

export const ItemTooltip: FC<Props> = React.memo(function ItemTooltip(props) {
  const { itemId } = props;

  const item = items.get(itemId);

  return (
    <Card className="p-2">
      <Column>
        <Typography className="font-bold text-center">{item?.display}</Typography>
        <Row className="gap-2">
          {item?.tags.map((tag) => (
            <Typography key={tag + Date.now()} className="p-1 rounded bg-gray-200 leading-tight">
              {tag}
            </Typography>
          ))}
        </Row>
      </Column>
    </Card>
  );
});
