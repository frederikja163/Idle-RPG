﻿import React, {
  type CSSProperties,
  type FC,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSocket } from "@/front-end/state/socket-provider.tsx";
import { Column } from "@/front-end/components/layout/column.tsx";
import { Row } from "../../layout/row.tsx";
import { InventoryItem } from "@/front-end/components/game/inventory/inventory-item.tsx";
import { Card } from "@/front-end/components/ui/card.tsx";
import { InventoryTab } from "@/front-end/components/game/inventory/inventory-tab.tsx";
import { useAtomValue } from "jotai";
import { selectedInventoryTabAtom } from "@/front-end/state/atoms.tsx";
import type { ItemStack } from "@/front-end/lib/types.ts";
import { getItemStacksFromInventory } from "@/front-end/lib/utils.ts";
import { ItemTag } from "@/shared/definition/definition-items.ts";

export const Inventory: FC = React.memo(function Inventory() {
  const socket = useSocket();
  const selectedTab = useAtomValue(selectedInventoryTabAtom);

  const [itemStacks, setItemStacks] = useState<ItemStack[]>();

  useEffect(() => {
    socket?.send("Item/GetItems", {});

    socket?.on("Item/UpdateItems", (socket, data) => {
      setItemStacks(getItemStacksFromInventory(data.items));
    });
  }, [socket]);

  const shownItems = useMemo(
    () =>
      itemStacks
        ?.filter((itemStack) => itemStack.item.tags.includes(selectedTab))
        .map((itemStack, i) => <InventoryItem key={i} itemStack={itemStack} />),
    [selectedTab, itemStacks]
  );

  return (
    <Card className="bg-card w-full overflow-hidden">
      <Column>
        <Row className="h-12" style={styles.itemContainer}>
          <InventoryTab itemCategory={ItemTag.Resource} label="Items" />
          <InventoryTab itemCategory={ItemTag.Tool} label="Tools" />
        </Row>
        <Row className="gap-2 p-4 h-80 overflow-y-scroll flex-wrap">
          {shownItems}
        </Row>
      </Column>
    </Card>
  );
});

// TODO: add empty boxes to inventory
const styles: { [key: string]: CSSProperties } = {
  container: {
    backgroundColor: "black",
    backgroundImage:
      "linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)",
    backgroundSize: "40px 40px",
    backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
  },
  itemContainer: {
    backgroundColor: "#00000010",
  },
};
