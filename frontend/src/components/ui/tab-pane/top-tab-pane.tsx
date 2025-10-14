import React, { type FC, useState } from 'react';
import { Card } from '@/frontend/components/ui/card';
import { Column } from '@/frontend/components/ui/layout/column';
import { Row } from '@/frontend/components/ui/layout/row';
import { TabButton } from '@/frontend/components/ui/tab-pane/tab-button';
import { Divider } from '@/frontend/components/ui/layout/divider';
import { nameOf } from '@/frontend/lib/function-utils';
import type { Tab } from '@/frontend/components/ui/tab-pane/types';

interface Props {
  tabs: Tab[];
  initialTabIndex?: number;
}

export const TopTabPane: FC<Props> = React.memo((props) => {
  const { tabs, initialTabIndex = 0 } = props;

  const [selectedTabIndex, setSelectedTabIndex] = useState(initialTabIndex);

  return (
    <Card className="flex p-4 bg-card">
      <Column className="h-full w-full">
        <Row className="gap-4">
          {tabs.map((tab, i) => (
            <TabButton
              key={tab.label}
              index={i}
              selectedIndex={selectedTabIndex}
              label={tab.label}
              orientation="horizontal"
              onClick={setSelectedTabIndex}>
              {tab.buttonContent}
            </TabButton>
          ))}
        </Row>
        <Divider orientation="horizontal" className="mb-4" />
        {tabs.at(selectedTabIndex)?.content}
      </Column>
    </Card>
  );
});

TopTabPane.displayName = nameOf({ TopTabPane });
