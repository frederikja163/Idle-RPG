import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { Card } from '@/frontend/components/ui/card';
import { Column } from '@/frontend/components/ui/layout/column';
import { Typography } from '@/frontend/components/ui/typography';
import { Row } from '@/frontend/components/ui/layout/row';
import { TabButton } from '@/frontend/components/ui/tab-pane/tab-button';
import { Divider } from '@/frontend/components/ui/layout/divider';
import { useWindowSize } from '@/frontend/hooks/use-window-size';
import { ToggleButton } from '@/frontend/components/ui/input/toggle-button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { nameOf } from '@/frontend/lib/function-utils';

export interface Tab {
  content: ReactNode;
  label?: string;
  buttonContent?: ReactNode;
}

interface Props {
  title: string;
  tabs: Tab[];
  collapsable?: boolean;
  initialTabIndex?: number;
}

export const SideTabPane: FC<Props> = React.memo(function SideTabPane(props) {
  const { title, tabs, collapsable, initialTabIndex = 0 } = props;

  const { width } = useWindowSize();

  const [selectedTabIndex, setSelectedTabIndex] = useState(initialTabIndex);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!collapsable) return;

    setCollapsed(width < 1000);
  }, [collapsable, width]);

  const handleCollapsedButton = useCallback((isCollapsed: boolean) => setCollapsed(isCollapsed), []);

  return (
    <Card className="flex p-4 bg-card">
      <Column className="h-full w-full gap-4">
        <Row className="gap-4 items-center">
          {collapsable && (
            <ToggleButton pressed={collapsed} onPressedChanged={handleCollapsedButton} label="Toggle buttons">
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </ToggleButton>
          )}
          <Typography className="text-2xl">{title}</Typography>
        </Row>
        <Divider />
        <Row className="h-full">
          {!collapsed && (
            <>
              <Column className="gap-4">
                {tabs.map((tab, i) => (
                  <TabButton
                    key={i}
                    index={i}
                    selectedIndex={selectedTabIndex}
                    label={tab.label}
                    orientation="vertical"
                    onClick={setSelectedTabIndex}>
                    {tab.buttonContent}
                  </TabButton>
                ))}
              </Column>
              <Divider orientation="vertical" className="mr-6" />
            </>
          )}
          {tabs.at(selectedTabIndex)?.content}
        </Row>
      </Column>
    </Card>
  );
});

SideTabPane.displayName = nameOf({ SideTabPane });
