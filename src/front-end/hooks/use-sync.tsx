import { useCallback } from 'react';
import { routes } from '@/front-end/router/routes.ts';
import { useSetAtom } from 'jotai/index';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useSocket } from '@/front-end/providers/socket-provider.tsx';
import { resetAtomsAtom, selectedProfileIdAtom } from '@/front-end/store/atoms.tsx';

export const useSync = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const resetAtoms = useSetAtom(resetAtomsAtom);
  const [selectedProfileId, setSelectedProfileId] = useAtom(selectedProfileIdAtom);

  const sync = useCallback(() => {
    if (!selectedProfileId) {
      navigate(routes.profiles);
      return;
    }

    const profileId = selectedProfileId;

    resetAtoms();
    setSelectedProfileId(undefined);

    console.debug('🔁 Syncing with server');
    socket?.send('Profile/Select', { profileId });
  }, [navigate, resetAtoms, selectedProfileId, setSelectedProfileId, socket]);

  return sync;
};
