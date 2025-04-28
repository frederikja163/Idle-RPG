import React, {type FC} from 'react';
import type {ItemDto} from '@/shared/socket-types.ts';
import {Text} from '@/front-end/components/ui/text.tsx';

interface Props {
  item: ItemDto;
}

export const InventoryItem: FC<Props> = React.memo((props) => {
  const {item} = props;

  return (
    <div className="grid w-10 h-10 bg-gray-200">
      <img src={`/assets/${item.itemId}.svg`} alt={item.itemId}/>
      <Text>
        {item.count}
      </Text>
      <Text>
        {item.itemId}
      </Text>
    </div>);
});