import React, {type FC, type ReactNode, useState} from 'react';
import {Card} from '@/front-end/components/ui/card.tsx';
import {Column} from '@/front-end/components/layout/column.tsx';
import {Typography} from '@/front-end/components/ui/typography.tsx';
import {Row} from '@/front-end/components/layout/row.tsx';
import {SideTabButton} from '@/front-end/components/ui/side-tab-pane/side-tab-button.tsx';
import {Divider} from "@/front-end/components/ui/divider.tsx";

export interface Tab {
  label: string;
  content: ReactNode;
}

interface Props {
  title: string;
  tabs: Tab[];
}

export const SideTabPane: FC<Props> = React.memo((props) => {
  const {title, tabs} = props;

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Card className="flex p-6 bg-card">
      <Column className="h-full w-full gap-6">
        <Typography className="text-2xl">{title}</Typography>
        <Divider/>
        <Row className="h-full">
          <Column className="gap-2">
            {tabs.map((tab, i) => <SideTabButton key={i} index={i} selectedIndex={selectedTabIndex} tab={tab}
                                                 onClick={setSelectedTabIndex}/>)}
          </Column>
          <Divider orientation="vertical"/>
          {tabs.at(selectedTabIndex)?.content}
        </Row>
      </Column>
    </Card>
  );
});
