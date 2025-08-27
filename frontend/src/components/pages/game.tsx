import React, { type FC } from 'react';
import { Inventory } from '@/frontend/components/game/inventory/inventory';
import { Column } from '@/frontend/components/ui/layout/column';
import { SkillsPane } from '@/frontend/components/game/skills/skills-pane';

export const Game: FC = React.memo(function Game() {
  return (
    <Column className="p-6 gap-6">
      <Inventory />
      <SkillsPane />
    </Column>
  );
});
