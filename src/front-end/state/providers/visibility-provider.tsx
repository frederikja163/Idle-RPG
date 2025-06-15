import React, { createContext, type FC, useCallback, useEffect, useState } from 'react';
import type { ProviderProps } from '@/front-end/lib/types.ts';
import { useSocket } from '@/front-end/state/providers/socket-provider.tsx';

const minHiddenMs = 1000 * 60 * 2;

const VisibilityContext = createContext(undefined);

export const VisibilityProvider: FC<ProviderProps> = React.memo(function VisibilityProvider(props) {
  const { children } = props;

  const socket = useSocket();

  const [isTabActive, setIsTabActive] = useState(true);
  const [tabHiddenTime, setTabHiddenTime] = useState(0);

  const handleVisibilityChange = useCallback(() => {
    setIsTabActive(document.visibilityState === 'visible');
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isTabActive) {
      setTabHiddenTime(new Date().getTime());
      return;
    }

    if (new Date().getTime() - tabHiddenTime > minHiddenMs) {
      console.debug('Syncing with server');
      socket?.send('Profile/Query', {
        profile: { activityId: true, activityStart: true },
        items: { index: true, count: true, id: true },
        skills: { xp: true, level: true, id: true },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTabActive]);

  return <VisibilityContext.Provider value={undefined}>{children}</VisibilityContext.Provider>;
});
