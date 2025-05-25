import React, { type FC } from 'react';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Row } from '@/front-end/components/layout/row.tsx';
import { BasicTooltip } from '@/front-end/components/ui/basic-tooltip.tsx';
import { ItemTooltip } from '@/front-end/components/game/item-tooltip.tsx';
import type { Item } from '@/shared/definition/schema/types/types-items.ts';

interface Props {
  item: Item;
}

export const InventoryItem: FC<Props> = React.memo(function InventoryItem(props) {
  const { item } = props;

  return (
    <BasicTooltip tooltipContent={<ItemTooltip itemId={item.itemId} />}>
      <Column className="bg-gray-200 rounded w-16 h-16 p-1 select-none">
        <Row className="aspect-square overflow-hidden justify-center">
          <img src={`/assets/items/${item.itemId}.svg`} alt={item.itemId} />
        </Row>
        <Typography className="row-start-2 col-span-2 text-center">{item.count}</Typography>
      </Column>
    </BasicTooltip>
  );
});
