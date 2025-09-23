import React, { type FC } from 'react';
import { type ItemAmount } from '@/shared/definition/definition-crafting';
import { nameOf } from '@/frontend/lib/function-utils';
import { Typography } from '@/frontend/components/ui/typography';
import { Card } from '@/frontend/components/ui/card';
import { Row } from '@/frontend/components/ui/layout/row';
import { InventoryItem } from '@/frontend/components/game/inventory/inventory-item';
import { useAtomValue } from 'jotai';
import { profileItemsAtom } from '@/frontend/store/atoms';

interface Props {
  itemAmounts: ItemAmount[];
  title?: string;
}

export const RecipeItemsTooltip: FC<Props> = React.memo((props) => {
  const { itemAmounts, title } = props;

  const profileItems = useAtomValue(profileItemsAtom);

  return (
    <Card className="flex-col p-4">
      {title && <Typography className="font-bold mb-2">{title}</Typography>}
      <Row className="justify-center">
        {itemAmounts.map((item) => {
          const profileItemAmount = profileItems.get(item.itemId)?.count ?? 0;
          return (
            <InventoryItem
              key={item.itemId}
              item={{ id: item.itemId, count: item.amount }}
              background={profileItemAmount < item.amount ? 'error' : 'standard'}
            />
          );
        })}
      </Row>
    </Card>
  );
});

RecipeItemsTooltip.displayName = nameOf({ RecipeItemsTooltip });
