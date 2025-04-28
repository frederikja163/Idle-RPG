import React, {type CSSProperties, type FC, useEffect, useState} from 'react';
import {useSocket} from '@/front-end/providers/socket-provider.tsx';
import type {InventoryDto} from '@/shared/socket-types.ts';
import {Column} from '@/front-end/components/layout/column.tsx';
import {Row} from '../layout/row';
import {InventoryItem} from '@/front-end/components/game/inventory-item.tsx';
import {Card} from '@/front-end/components/ui/card.tsx';
import {InventoryTab} from '@/front-end/components/game/inventory-tab.tsx';

export const Inventory: FC = React.memo(() => {
  const socket = useSocket();

  const [items, setItems] = useState<InventoryDto>();

  useEffect(() => {
    socket?.send('Inventory/GetInventory', {});

    socket?.on('Inventory/UpdateInventory', (socket, data) => {
      setItems(data.items);
    });
  }, []);

  // TODO: manage state of selected tab
  return (
    <Card className="bg-green-100">
      <Column>
        <Row className="rounded-t-xl h-12" style={styles.itemContainer}>
          <InventoryTab id="items" label="Items" onClick={() => {
          }}/>
        </Row>
        <Row className="gap-2 p-4">
          {items?.map((item, i) => <InventoryItem key={i} item={item}/>)}
        </Row>
      </Column>
    </Card>
  );
});

// TODO: add empty boxes to inventory
const styles: { [key: string]: CSSProperties } = {
  container: {
    backgroundColor: 'black',
    backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
    backgroundSize: '40px 40px',
    backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
  },
  itemContainer: {
    backgroundColor: '#00000010',
  },
};