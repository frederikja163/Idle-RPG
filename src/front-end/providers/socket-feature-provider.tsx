import React, { createContext, type FC, useCallback, useEffect, useRef, useState } from 'react';
import type { ProviderProps } from '@/front-end/types/provider-types.ts';
import { useOnSocket, useSocket } from '@/front-end/providers/socket-provider.tsx';
import { useAtom, useSetAtom } from 'jotai/index';
import {
  activeActivityAtom,
  profileItemsAtom,
  profilesAtom,
  profileSkillsAtom,
  resetAtomsAtom,
  selectedProfileIdAtom,
} from '@/front-end/store/atoms.tsx';
import { routes } from '@/front-end/router/routes.ts';
import {
  getItem,
  getMsUntilActionDone,
  getSkill,
  updateItems,
  updateProfiles,
  updateSkills,
} from '@/front-end/lib/utils.ts';
import { activities, type ActivityDef, type ActivityId } from '@/shared/definition/definition-activities.ts';
import type { Timeout } from 'react-number-format/types/types';
import { processActivity } from '@/shared/util/util-activities.ts';
import type { useNavigate } from 'react-router-dom';
import type { DataType, ServerClientEvent, SocketId } from '@/shared/socket/socket-types.ts';
import { ErrorType } from '@/shared/socket/socket-errors.ts';
import { useSync } from '@/front-end/hooks/use-sync.tsx';

const SocketFeatureContext = createContext(undefined);

interface Props extends ProviderProps {
  navigate: ReturnType<typeof useNavigate>;
}

export const SocketFeatureProvider: FC<Props> = React.memo(function SocketFeatureProvider(props) {
  const { navigate, children } = props;

  const socket = useSocket();
  const sync = useSync();

  const resetAtoms = useSetAtom(resetAtomsAtom);
  const setProfiles = useSetAtom(profilesAtom);
  const [selectedProfileId, setSelectedProfileId] = useAtom(selectedProfileIdAtom);
  const setActiveActivity = useSetAtom(activeActivityAtom);
  const [profileItems, setProfileItems] = useAtom(profileItemsAtom);
  const [profileSkills, setProfileSkills] = useAtom(profileSkillsAtom);

  const [actionTimeoutId, setActionTimeoutId] = useState<Timeout>();
  const [actionIntervalId, setActionIntervalId] = useState<Timeout>();

  const profileItemsRef = useRef(profileItems);
  const profileSkillsRef = useRef(profileSkills);

  useEffect(() => {
    profileItemsRef.current = profileItems;
  }, [profileItems]);

  useEffect(() => {
    profileSkillsRef.current = profileSkills;
  }, [profileSkills]);

  const clearTimeouts = useCallback(() => {
    clearTimeout(actionTimeoutId);
    clearInterval(actionIntervalId);
  }, [actionIntervalId, actionTimeoutId]);

  const processActivityLocal = useCallback(
    async (activityDef: ActivityDef, activityTimeMs: number) => {
      const now = new Date();
      const start = new Date(now.getTime() - activityTimeMs);

      const { items, skills } = await processActivity(start, now, activityDef, {
        getSkill: getSkill(profileSkillsRef.current),
        getItem: getItem(profileItemsRef.current),
      });

      setProfileSkills(updateSkills(skills));
      setProfileItems(updateItems(items));
    },
    [setProfileItems, setProfileSkills],
  );

  const startActivity = useCallback(
    (activityId: ActivityId, activityStart: Date) => {
      setActiveActivity({ activityId, activityStart });

      const activityDef = activities.get(activityId);
      if (!activityDef) return;

      const msUntilActionDone = getMsUntilActionDone(activityId, activityStart);
      const activityActionTime = activityDef.time;

      clearTimeouts();

      const __ = processActivityLocal(activityDef, new Date().getTime() - activityStart.getTime());
      const timeoutId = setTimeout(() => {
        const _ = processActivityLocal(activityDef, activityActionTime);

        const intervalId = setInterval(() => {
          const _ = processActivityLocal(activityDef, activityActionTime);
        }, activityActionTime);

        setActionIntervalId(intervalId);
      }, msUntilActionDone);

      setActionTimeoutId(timeoutId);
    },
    [clearTimeouts, processActivityLocal, setActiveActivity],
  );

  const handleManyProfilesUpdated = useCallback(
    (_: SocketId, { profiles }: DataType<ServerClientEvent, 'Profile/UpdatedMany'>) => {
      setProfiles(updateProfiles(profiles));
    },
    [setProfiles],
  );

  const handleProfileUpdated = useCallback(
    async (_: SocketId, { profile, items, skills }: DataType<ServerClientEvent, 'Profile/Updated'>) => {
      if (profile && profile.id && profile.id != selectedProfileId) {
        resetAtoms();
        clearTimeouts();
        setSelectedProfileId(profile.id);

        socket?.send('Profile/Query', {
          profile: { activityId: true, activityStart: true },
          items: { index: true, count: true, id: true },
          skills: { xp: true, level: true, id: true },
        });

        navigate(routes.game);
        return;
      }

      if (items) setProfileItems(updateItems(items));
      if (skills) setProfileSkills(updateSkills(skills));
      if (profile && profile.activityId && profile.activityStart) {
        // TODO: A timeout here is probably not the right solution, but it works? for now??
        // The problem is that setProfileItems and setProfileSkills only sets the values with a small delay,
        // and we can only run startActivity after they are set.
        setTimeout(() => {
          if (profile && profile.activityId && profile.activityStart) {
            startActivity(profile.activityId, profile.activityStart);
          }
        }, 100);
      } else if (profile?.activityId == 'None') {
        clearTimeouts();
        setActiveActivity(undefined);
      }
    },
    [
      clearTimeouts,
      startActivity,
      navigate,
      resetAtoms,
      selectedProfileId,
      setActiveActivity,
      setProfileItems,
      setProfileSkills,
      setSelectedProfileId,
      socket,
    ],
  );

  const handlePong = useCallback(() => console.debug('Received pong'), []);

  const handleError = useCallback(
    (_: SocketId, data: DataType<ServerClientEvent, 'Connection/Error'>) => {
      if (socket) socket.onError(data.errorType, data.message);

      switch (data.errorType) {
        case ErrorType.Desync:
          sync();
          return;

        case ErrorType.RequiresLogin:
          setSelectedProfileId(undefined);
          return;

        case ErrorType.ArgumentOutOfRange:
          setSelectedProfileId(undefined);
          return;

        default:
          console.warn('No error handling implemented for: ', data.errorType, data.message);
      }
    },
    [socket, sync, setSelectedProfileId],
  );

  useOnSocket('Profile/UpdatedMany', handleManyProfilesUpdated);
  useOnSocket('Profile/Updated', handleProfileUpdated);
  useOnSocket('Connection/Pong', handlePong);
  useOnSocket('Connection/Error', handleError);

  return <SocketFeatureContext.Provider value={undefined}>{children}</SocketFeatureContext.Provider>;
});
