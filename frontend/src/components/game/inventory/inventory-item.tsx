import React, { type FC } from 'react';
import { Typography } from '@/frontend/components/ui/typography';
import { Column } from '@/frontend/components/ui/layout/column';
import { Row } from '@/frontend/components/ui/layout/row';
import { BasicTooltip } from '@/frontend/components/ui/basic-tooltip';
import { ItemTooltip } from '@/frontend/components/game/item-tooltip';
import type { Item } from '@/shared/definition/schema/types/types-items';
import { nameOf } from '@/frontend/lib/function-utils';

interface Props {
  item: Partial<Item> & Pick<Item, 'id'>;
  background?: 'standard' | 'error';
  disableTooltip?: boolean;
}

export const InventoryItem: FC<Props> = React.memo((props) => {
  const { item, background = 'standard', disableTooltip = false } = props;

  return (
    <BasicTooltip tooltipContent={<ItemTooltip itemId={item.id} />} isDisabled={disableTooltip}>
      <Column
        className={`rounded min-w-16 w-16 h-16 p-1 select-none ${background === 'error' ? 'bg-red-300' : 'bg-gray-200'}`}>
        <Row className="aspect-square overflow-hidden justify-center">
          <img src={`${import.meta.env.VITE_BASE_URL}/assets/items/${item.id}.svg`} alt={item.id} />
        </Row>
        <Typography className="text-sm row-start-2 col-span-2 text-center">{item.count}</Typography>
      </Column>
    </BasicTooltip>
  );
});

InventoryItem.displayName = nameOf({ InventoryItem });
