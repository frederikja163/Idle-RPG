import React, {type FC} from 'react';
import type {ItemDto} from '@/shared/socket-types.ts';
import {Typography} from '@/front-end/components/ui/typography.tsx';
import {Column} from '@/front-end/components/layout/column.tsx';
import {items} from '@/shared/items';

interface Props {
  item: ItemDto;
}

export const InventoryItem: FC<Props> = React.memo((props) => {
  const {item} = props;

  return (
    <Column className="bg-gray-200 rounded w-16 h-16 p-1" title={items.get(item.itemId)?.display}>
      <img src={`/assets/${item.itemId}.svg`} alt={item.itemId}/>
      <Typography className="row-start-2 col-span-2 text-center">
        {item.count}
      </Typography>
    </Column>);
});