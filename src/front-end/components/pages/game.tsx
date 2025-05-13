import React, {type FC} from 'react';
import {Inventory} from '@/front-end/components/game/inventory/inventory.tsx';
import {SkillsPane} from '@/front-end/components/game/skills/skills-pane.tsx';
import {Column} from '@/front-end/components/layout/column.tsx';

export const Game: FC = React.memo(function Game() {
  return (
    <Column className="m-6 gap-6">
      <Inventory/>
      <SkillsPane/>
    </Column>
  );
});