import { useCallback, useEffect, useState } from 'react';

export const useVisibility = () => {
  const [isTabActive, setIsTabActive] = useState(true);

  const handleVisibilityChange = useCallback(() => {
    setIsTabActive(document.visibilityState === 'visible');
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return isTabActive;
};
