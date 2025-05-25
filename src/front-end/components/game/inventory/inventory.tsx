import React, { type CSSProperties, type FC, useEffect, useMemo } from 'react';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Row } from '../../layout/row.tsx';
import { InventoryItem } from '@/front-end/components/game/inventory/inventory-item.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { InventoryTab } from '@/front-end/components/game/inventory/inventory-tab.tsx';
import { useAtom, useAtomValue } from 'jotai';
import { profileItemsAtom, selectedInventoryTabAtom } from '@/front-end/state/atoms.tsx';
import { items as itemDefinitions, ItemTag } from '@/shared/definition/definition-items.ts';
import { mergeItems } from '@/front-end/lib/utils.ts';

export const Inventory: FC = React.memo(function Inventory() {
  const socket = useSocket();
  const selectedTab = useAtomValue(selectedInventoryTabAtom);
  const [profileItems, setProfileItems] = useAtom(profileItemsAtom);

  useEffect(() => {
    socket?.send('Item/GetItems', {});

    socket?.on('Item/UpdateItems', (socket, data) => {
      setProfileItems(mergeItems(profileItems, data.items));
    });
  }, [profileItems, setProfileItems, socket]);

  const shownItems = useMemo(
    () =>
      profileItems
        .entries()
        .filter(([itemId, _]) => itemDefinitions.get(itemId)?.tags.includes(selectedTab))
        .map(([_, item], i) => <InventoryItem key={i} item={item} />),
    [selectedTab, profileItems],
  );

  return (
    <Card className="bg-card w-full overflow-hidden">
      <Column>
        <Row className="h-12" style={styles.itemContainer}>
          <InventoryTab itemCategory={ItemTag.Resource} label="Items" />
          <InventoryTab itemCategory={ItemTag.Tool} label="Tools" />
        </Row>
        <Row className="gap-2 p-4 h-80 overflow-y-scroll flex-wrap">{shownItems}</Row>
      </Column>
    </Card>
  );
});

// TODO: add empty boxes to inventory
const styles: { [key: string]: CSSProperties } = {
  container: {
    backgroundColor: 'black',
    backgroundImage:
      'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
    backgroundSize: '40px 40px',
    backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
  },
  itemContainer: {
    backgroundColor: '#00000010',
  },
};
