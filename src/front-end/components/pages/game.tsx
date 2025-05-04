import React, {type FC} from 'react';
import {Inventory} from '@/front-end/components/game/inventory.tsx';

export const Game: FC = React.memo(() => {
  return (
    <div className="m-6">
      <Inventory/>
    </div>
  );
});