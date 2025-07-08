import React, { type CSSProperties, type FC, useMemo } from 'react';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Row } from '../../layout/row.tsx';
import { InventoryItem } from '@/front-end/components/game/inventory/inventory-item.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { InventoryTab } from '@/front-end/components/game/inventory/inventory-tab.tsx';
import { useAtomValue } from 'jotai';
import { profileItemsAtom, selectedInventoryTabAtom } from '@/front-end/store/atoms.tsx';
import { items as itemDefinitions } from '@/shared/definition/definition-items.ts';
import { inventoryTabMap } from '@/front-end/constants/inventory-consts.ts';

export const Inventory: FC = React.memo(function Inventory() {
  const selectedTab = useAtomValue(selectedInventoryTabAtom);
  const profileItems = useAtomValue(profileItemsAtom);

  const shownItems = useMemo(() => {
    const tags = inventoryTabMap.get(selectedTab);
    return profileItems
      .entries()
      .filter(
        ([itemId, item]) =>
          (item.count ?? 0) >= 1 &&
          (tags?.length == 0 || itemDefinitions.get(itemId)?.tags.find((t) => tags?.includes(t)) !== undefined),
      )
      .map(([itemId, item]) => <InventoryItem key={itemId} item={item} />);
  }, [selectedTab, profileItems]);

  return (
    <Card className="bg-card w-full overflow-hidden">
      <Column>
        <Row className="h-12" style={styles.itemContainer}>
          {inventoryTabMap.keys().map((label) => (
            <InventoryTab label={label} key={label} />
          ))}
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
