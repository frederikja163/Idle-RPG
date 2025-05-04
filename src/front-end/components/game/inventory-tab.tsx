import React, { type FC, useCallback } from 'react';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import type { ItemTags } from '@/shared/socket/socket.types';
import { selectedInventoryTabAtom } from '@/front-end/state/atoms.tsx';
import { useAtom } from 'jotai';
import { Row } from '@/front-end/components/layout/row.tsx';

interface Props {
  label: string;
  itemCategory: ItemTags;
}

export const InventoryTab: FC<Props> = React.memo((props) => {
  const { label, itemCategory } = props;

  const [selectedTab, setSelectedTab] = useAtom(selectedInventoryTabAtom);

  const handleClick = useCallback(() => {
    setSelectedTab(itemCategory);
  }, [setSelectedTab, itemCategory]);

  const background = itemCategory === selectedTab ? 'bg-green-100' : '';

  return (
    <Row onClick={handleClick} className={`p-2 cursor-pointer ${background}`}>
      <Typography className="text-center">{label}</Typography>
    </Row>
  );
});
