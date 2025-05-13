import React, {type FC, useCallback} from 'react';
import type {Tab} from '@/front-end/components/ui/side-tab-pane/side-tab-pane.tsx';
import {Typography} from "@/front-end/components/ui/typography.tsx";

interface Props {
  index: number;
  selectedIndex: number;
  tab: Tab;

  onClick(index: number): void;
}

export const SideTabButton: FC<Props> = React.memo(function SideTabButton(props) {
  const {index, selectedIndex, tab, onClick} = props;

  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  return (
    <button
      onClick={handleClick}
      style={{marginRight: "-1px"}}
      className={
        `p-2 cursor-pointer border-2 border-solid border-transparent hover:text-secondary ${selectedIndex === index && "text-primary border-r-primary"}`
      }
    >
      <Typography>
        {tab.label}
      </Typography>
    </button>
  );
});