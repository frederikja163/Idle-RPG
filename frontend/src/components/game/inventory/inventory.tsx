import React, { type CSSProperties, type FC, useMemo } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import { Row } from '@/frontend/components/ui/layout/row';
import { InventoryItem } from '@/frontend/components/game/inventory/inventory-item';
import { Card } from '@/frontend/components/ui/card';
import { InventoryTab } from '@/frontend/components/game/inventory/inventory-tab';
import { useAtomValue } from 'jotai';
import { profileItemsAtom, selectedInventoryTabAtom } from '@/frontend/store/atoms';
import { items as itemDefinitions } from '@/shared/definition/definition-items';
import { inventoryTabMap } from '@/frontend/constants/inventory-consts';
import { TopTabPane } from '@/frontend/components/ui/tab-pane/top-tab-pane';
import { mapEntriesToArray, mapKeysToArray } from '@/frontend/lib/array-utils';

export const Inventory: FC = React.memo(function Inventory() {
  const selectedTab = useAtomValue(selectedInventoryTabAtom);
  const profileItems = useAtomValue(profileItemsAtom);

  const shownItems = useMemo(() => {
    const tags = inventoryTabMap.get(selectedTab);
    return mapEntriesToArray(profileItems)
      .filter(
        ([itemId, item]) =>
          (item.count ?? 0) >= 1 &&
          (tags?.length == 0 || itemDefinitions.get(itemId)?.tags.find((t) => tags?.includes(t)) !== undefined),
      )
      .map(([itemId, item]) => <InventoryItem key={itemId} item={item} />);
  }, [selectedTab, profileItems]);

  const inventoryTabs = useMemo(() => inventoryTabMap.get(selectedTab), []);

  return (
    <>
      <Card className="bg-card w-full overflow-hidden">
        <Column>
          <Row className="h-12" style={styles.itemContainer}>
          {mapKeysToArray(inventoryTabMap).map((label) => (
              <InventoryTab label={label} key={label} />
            ))}
          </Row>
          <Row className="gap-2 p-4 h-80 overflow-y-scroll flex-wrap">{shownItems}</Row>
        </Column>
      </Card>
      <TopTabPane tabs={} />
    </>
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
