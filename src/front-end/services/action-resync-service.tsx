import React, { type FC, useEffect, useState } from 'react';
import { useVisibility } from '@/front-end/hooks/use-visibility.tsx';
import { useSocket } from '@/front-end/providers/socket-provider.tsx';

const minHiddenMs = 1000 * 60 * 2;

export const ActionResyncService: FC = React.memo(function ActionResyncService() {
  const isTabActive = useVisibility();
  const socket = useSocket();

  const [tabHiddenTime, setTabHiddenTime] = useState(0);

  useEffect(() => {
    if (!isTabActive) {
      setTabHiddenTime(new Date().getTime());
      return;
    }

    if (new Date().getTime() - tabHiddenTime < minHiddenMs) return;

    console.debug('🔁 Syncing with server');
    socket?.send('Profile/Query', {
      profile: { activityId: true, activityStart: true },
      items: { index: true, count: true, id: true },
      skills: { xp: true, level: true, id: true },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTabActive]);

  return null;
});
