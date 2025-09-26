import React, { type FC, useMemo } from 'react';
import { Row } from '@/frontend/components/ui/layout/row';
import { InventoryItem } from '@/frontend/components/game/inventory/inventory-item';
import { useAtomValue } from 'jotai';
import { profileItemsAtom, selectedInventoryTabAtom } from '@/frontend/store/atoms';
import { items as itemDefinitions } from '@/shared/definition/definition-items';
import { inventoryTabMap } from '@/frontend/constants/inventory-consts';
import { TopTabPane } from '@/frontend/components/ui/tab-pane/top-tab-pane';
import { mapEntriesToArray } from '@/frontend/lib/array-utils';
import type { Item } from '@/shared/definition/schema/types/types-items';
import type { Tab } from '@/frontend/components/ui/tab-pane/types';
import { nameOf } from '@/frontend/lib/function-utils';

export const Inventory: FC = React.memo(() => {
  const selectedTab = useAtomValue(selectedInventoryTabAtom);
  const profileItems = useAtomValue(profileItemsAtom);

  const inventoryTabsDefinition = mapEntriesToArray(inventoryTabMap);

  const selectedTabIndex = useMemo(() => {
    const index = inventoryTabsDefinition.findIndex((tab) => tab.at(0) === selectedTab);
    return index === -1 ? undefined : index;
  }, [inventoryTabsDefinition, selectedTab]);

  const inventoryTabs: Tab[] = useMemo(
    () =>
      inventoryTabsDefinition.map(([label, itemTags]) => {
        const shownItems = mapEntriesToArray(profileItems)
          .filter(
            ([itemId, item]) =>
              (item.count ?? 0) >= 1 &&
              (itemTags?.length == 0 ||
                itemDefinitions.get(itemId)?.tags.find((t) => itemTags?.includes(t)) !== undefined),
          )
          .map(([itemId, item]) => <InventoryItem key={itemId} item={item as Partial<Item> & Pick<Item, 'id'>} />);

        return {
          label,
          content: <Row className="gap-2 h-80 overflow-y-scroll flex-wrap">{shownItems}</Row>,
        };
      }),
    [inventoryTabsDefinition, profileItems],
  );

  return <TopTabPane tabs={inventoryTabs} initialTabIndex={selectedTabIndex} />;
});

Inventory.displayName = nameOf({ Inventory });

// TODO: add empty boxes to inventory
