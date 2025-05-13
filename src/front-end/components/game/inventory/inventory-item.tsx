import React, {type FC} from "react";
import {Typography} from "@/front-end/components/ui/typography.tsx";
import {Column} from "@/front-end/components/layout/column.tsx";
import {Row} from "@/front-end/components/layout/row.tsx";
import type {ItemStack} from "@/front-end/lib/types.ts";
import {BasicTooltip} from "@/front-end/components/ui/basic-tooltip.tsx";
import {ItemTooltip} from "@/front-end/components/game/item-tooltip.tsx";

interface Props {
  itemStack: ItemStack;
}

export const InventoryItem: FC<Props> = React.memo(function InventoryItem(props) {
  const {itemStack} = props;

  return (
    <BasicTooltip tooltipContent={<ItemTooltip itemId={itemStack.item.id}/>}>
      <Column className="bg-gray-200 rounded w-16 h-16 p-1 select-none">
        <Row className="aspect-square overflow-hidden justify-center">
          <img
            src={`/assets/items/${itemStack.item.id}.svg`}
            alt={itemStack.item.id}
          />
        </Row>
        <Typography className="row-start-2 col-span-2 text-center">
          {itemStack.count}
        </Typography>
      </Column>
    </BasicTooltip>
  );
});
