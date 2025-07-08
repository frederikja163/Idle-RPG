import React, { type FC, useEffect, useState } from 'react';
import { useVisibility } from '@/front-end/hooks/use-visibility.tsx';
import { useSync } from '@/front-end/hooks/use-sync.tsx';

const minHiddenMs = 1000 * 5;

export const ResyncService: FC = React.memo(function ActionResyncService() {
  const isTabActive = useVisibility();
  const sync = useSync();

  const [tabHiddenTime, setTabHiddenTime] = useState(0);

  useEffect(() => {
    if (!isTabActive) {
      setTabHiddenTime(new Date().getTime());
      return;
    }

    if (new Date().getTime() - tabHiddenTime < minHiddenMs) return;

    //TODO: call ping-pong socket event here, instead of sync
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTabActive]);

  return null;
});
