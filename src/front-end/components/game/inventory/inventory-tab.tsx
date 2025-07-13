import React, { type FC, useCallback } from 'react';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { selectedInventoryTabAtom } from '@/front-end/store/atoms.tsx';
import { useAtom } from 'jotai';
import { Row } from '@/front-end/components/layout/row.tsx';

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
