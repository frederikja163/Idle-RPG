import React, { type FC, useMemo } from 'react';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Row } from '@/front-end/components/layout/row.tsx';
import type { ItemStack } from '@/front-end/lib/types.ts';
import { BasicTooltip } from '@/front-end/components/ui/basic-tooltip.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { itemTagDisplayMap } from '@/shared/definition/definition.items';

interface Props {
  itemStack: ItemStack;
}

export const InventoryItem: FC<Props> = React.memo((props) => {
  const { itemStack } = props;

  const tooltip = useMemo(
    () => (
      <Card className="p-2">
        <Column>
          <Typography className="font-bold text-center">{itemStack.item.display}</Typography>
          <Row className="gap-2">
            {itemStack.item.tags.map((tag, i) => (
              <Typography key={i} className="p-1 rounded bg-gray-200 leading-tight">
                {itemTagDisplayMap.get(tag)}
              </Typography>
            ))}
          </Row>
        </Column>
      </Card>
    ),
    [itemStack.item.display, itemStack.item.tags],
  );

  return (
    <BasicTooltip tooltipContent={tooltip}>
      <Column className="bg-gray-200 rounded w-16 h-16 p-1 select-none">
        <Row className="aspect-square overflow-hidden justify-center">
          <img src={`/assets/${itemStack.item.id}.svg`} alt={itemStack.item.id} />
        </Row>
        <Typography className="row-start-2 col-span-2 text-center">{itemStack.count}</Typography>
      </Column>
    </BasicTooltip>
  );
});
