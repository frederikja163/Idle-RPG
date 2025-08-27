import { useCallback } from 'react';
import { routes } from '@/frontend/router/routes';
import { useSetAtom } from 'jotai/index';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useSocket } from '@/frontend/providers/socket-provider';
import { resetAtomsAtom, selectedProfileIdAtom } from '@/frontend/store/atoms';

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
