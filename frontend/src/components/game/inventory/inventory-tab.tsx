import React, { type FC, useCallback } from 'react';
import { Typography } from '@/frontend/components/ui/typography';
import { selectedInventoryTabAtom } from '@/frontend/store/atoms';
import { useAtom } from 'jotai';
import { Row } from '@/frontend/components/ui/layout/row';

interface Props {
  label: string;
}

export const InventoryTab: FC<Props> = React.memo(function InventoryTab(props) {
  const { label } = props;

  const [selectedTab, setSelectedTab] = useAtom(selectedInventoryTabAtom);

  const handleClick = useCallback(() => {
    setSelectedTab(label);
  }, [setSelectedTab, label]);

  const background = label === selectedTab ? 'bg-primary' : '';

  return (
    <Row onClick={handleClick} className={`p-2 cursor-pointer ${background}`}>
      <Typography className="text-center">{label}</Typography>
    </Row>
  );
});
