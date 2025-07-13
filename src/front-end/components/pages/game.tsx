import React, { type FC } from 'react';
import { Inventory } from '@/front-end/components/game/inventory/inventory.tsx';
import { Column } from '@/front-end/components/ui/layout/column.tsx';
import { SkillsPane } from '@/front-end/components/game/skills/skills-pane.tsx';

export const Game: FC = React.memo(function Game() {
  return (
    <Column className="m-6 gap-6">
      <Inventory />
      <SkillsPane />
    </Column>
  );
});
