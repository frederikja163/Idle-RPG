import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { Card } from '@/front-end/components/ui/card.tsx';
import { Column } from '@/front-end/components/ui/layout/column.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Row } from '@/front-end/components/ui/layout/row.tsx';
import { SideTabButton } from '@/front-end/components/ui/side-tab-pane/side-tab-button.tsx';
import { Divider } from '@/front-end/components/ui/layout/divider.tsx';
import { useWindowSize } from '@/front-end/hooks/use-window-size.tsx';
import { ToggleButton } from '@/front-end/components/ui/input/toggle-button.tsx';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export interface Tab {
  content: ReactNode;
  label?: string;
  buttonContent?: ReactNode;
}

interface Props {
  title: string;
  tabs: Tab[];
  collapsable?: boolean;
}

export const SideTabPane: FC<Props> = React.memo(function SideTabPane(props) {
  const { title, tabs, collapsable } = props;

  const { width } = useWindowSize();

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
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
              {' '}
              <Column className="gap-4">
                {tabs.map((tab, i) => (
                  <SideTabButton
                    key={tab.label}
                    index={i}
                    selectedIndex={selectedTabIndex}
                    label={tab.label}
                    onClick={setSelectedTabIndex}>
                    {tab.buttonContent}
                  </SideTabButton>
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
