import React, { type FC } from 'react';
import { Inventory } from '@/front-end/components/game/inventory/inventory.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';
import { SkillsPane } from '@/front-end/components/game/skills/skills-pane.tsx';
import { Button } from '@/front-end/components/ui/button.tsx';
import { useSync } from '@/front-end/hooks/use-sync.tsx';

export const Game: FC = React.memo(function Game() {
  const sync = useSync();
  
  return (
    <Column className="m-6 gap-6">
      <Inventory />
      <SkillsPane />
      <Button onClick={sync} />
    </Column>
  );
});
