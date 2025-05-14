import React, { type FC, useCallback } from "react";
import { Typography } from "@/front-end/components/ui/typography.tsx";
import { selectedInventoryTabAtom } from "@/front-end/state/atoms.tsx";
import { useAtom } from "jotai";
import { Row } from "@/front-end/components/layout/row.tsx";
import type { ItemTag } from "@/shared/definition/definition-items";

interface Props {
  label: string;
  itemCategory: ItemTag;
}

export const InventoryTab: FC<Props> = React.memo(function InventoryTab(props) {
  const { label, itemCategory } = props;

  const [selectedTab, setSelectedTab] = useAtom(selectedInventoryTabAtom);

  const handleClick = useCallback(() => {
    setSelectedTab(itemCategory);
  }, [setSelectedTab, itemCategory]);

  const background = itemCategory === selectedTab ? "bg-primary" : "";

  return (
    <Row onClick={handleClick} className={`p-2 cursor-pointer ${background}`}>
      <Typography className="text-center">{label}</Typography>
    </Row>
  );
});
