import React, { type FC, useCallback } from 'react';
import { Inventory } from '@/front-end/components/game/inventory/inventory.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';
import { SkillsPane } from '@/front-end/components/game/skills/skills-pane.tsx';
import { Button } from '@/front-end/components/ui/button.tsx';
import { useSocket } from '@/front-end/state/providers/socket-provider.tsx';
import { useAtomValue } from 'jotai';
import { selectedProfileIdAtom } from '@/front-end/state/atoms.tsx';

export const Game: FC = React.memo(function Game() {
  const socket = useSocket();

  const id = useAtomValue(selectedProfileIdAtom);

  const selell = useCallback(() => {
    if (!id) return;

    socket?.send('Profile/Select', { profileId: id });
  }, [id, socket]);

  return (
    <Column className="m-6 gap-6">
      <Button onClick={selell}>KLIK</Button>
      <Inventory />
      <SkillsPane />
    </Column>
  );
});
