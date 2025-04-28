import React, {type FC, useEffect, useState} from 'react';
import {useSocket} from '@/front-end/providers/socket-provider.tsx';
import type {InventoryDto} from '@/shared/socket-types.ts';
import {Column} from '@/front-end/components/layout/column.tsx';
import {Row} from '../layout/row';
import {InventoryItem} from '@/front-end/components/game/inventory-item.tsx';
import {Card} from '@/front-end/components/ui/card.tsx';

export const Inventory: FC = React.memo(() => {
  const socket = useSocket();

  const [items, setItems] = useState<InventoryDto>();

  useEffect(() => {
    socket?.send('Inventory/GetInventory', {});

    socket?.on('Inventory/UpdateInventory', (socket, data) => {
      setItems(data.items);
    });
  }, []);

  return (
    <Card>
      <Column>
        <Row>Tabs</Row>
        <Row>
          {items?.map((item, i) => <InventoryItem key={i} item={item}/>)}
        </Row>
      </Column>
    </Card>
  );
});