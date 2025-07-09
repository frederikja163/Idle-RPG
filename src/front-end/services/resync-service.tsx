import React, { type FC, useEffect, useState } from 'react';
import { useVisibility } from '@/front-end/hooks/use-visibility.tsx';
import { useSocket } from '@/front-end/providers/socket-provider.tsx';

const minHiddenMs = 1000 * 5;

export const ResyncService: FC = React.memo(function ActionResyncService() {
  const isTabActive = useVisibility();
  const socket = useSocket();

  const [tabHiddenTime, setTabHiddenTime] = useState(0);

  useEffect(() => {
    if (!isTabActive) {
      setTabHiddenTime(new Date().getTime());
      return;
    }

    if (new Date().getTime() - tabHiddenTime < minHiddenMs) return;

    socket?.send('Connection/Ping', {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTabActive]);

  return null;
});
