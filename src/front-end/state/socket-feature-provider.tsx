import React, { createContext, type FC, useCallback, useEffect, useRef, useState } from 'react';
import type { ProviderProps } from '@/front-end/lib/types.ts';
import { useOnSocket, useSocket } from '@/front-end/state/socket-provider.tsx';
import { useAtom, useSetAtom } from 'jotai/index';
import {
  activeActivityAtom,
  profileItemsAtom,
  profilesAtom,
  profileSkillsAtom,
  resetAtomsAtom,
  selectedProfileIdAtom,
} from '@/front-end/state/atoms.tsx';
import { routes } from '@/front-end/router/routes.ts';
import {
  getItem,
  getMsUntilActionDone,
  getSkill,
  updateItems,
  updateProfiles,
  updateSkills,
} from '@/front-end/lib/utils.ts';
import { activities, type ActivityDef, type ActivityId } from '@/shared/definition/definition-activities';
import type { Timeout } from 'react-number-format/types/types';
import { processActivity } from '@/shared/util/util-activities.ts';
import type { useNavigate } from 'react-router-dom';
import type { ClientData, SocketId } from '@/shared/socket/socket-types.ts';
import { errorMessages, ErrorType } from '@/shared/socket/socket-errors.ts';
import { useToast } from '@/front-end/state/toast-provider.tsx';
import { dateTimeFormat } from '@/front-end/lib/date-time-consts.ts';

const SocketFeatureContext = createContext(undefined);

interface Props extends ProviderProps {
  navigate: ReturnType<typeof useNavigate>;
}

export const SocketFeatureProvider: FC<Props> = React.memo(function SocketFeatureProvider(props) {
  const { navigate, children } = props;

  const socket = useSocket();
  const { displayToast } = useToast();

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

  const handleUpdatedManyProfiles = useCallback(
    (_: SocketId, { profiles }: ClientData<'Profile/UpdatedMany'>) => {
      setProfiles(updateProfiles(profiles));
    },
    [setProfiles],
  );

  const handleActivityStarted = useCallback(
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

  const handleUpdated = useCallback(
    async (_: SocketId, { profile, items, skills }: ClientData<'Profile/Updated'>) => {
      if (profile && profile.id != selectedProfileId) {
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
        // and we can only run handleActivityStarted after they are set.
        setTimeout(() => {
          if (profile && profile.activityId && profile.activityStart) {
            handleActivityStarted(profile.activityId, profile.activityStart);
          }
        }, 100);
      } else if (profile?.activityId == 'None') {
        clearTimeouts();
        setActiveActivity(undefined);
      }
    },
    [
      clearTimeouts,
      handleActivityStarted,
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

  const handleError = useCallback(
    (_: SocketId, { errorType, message }: ClientData<'System/Error'>) => {
      socket?.onError(errorType, message);

      displayToast(errorMessages[errorType], 'error');

      switch (errorType) {
        case ErrorType.RequiresLogin:
          setSelectedProfileId(undefined);
          return;

        case ErrorType.ArgumentOutOfRange:
          setSelectedProfileId(undefined);
          return;

        default:
          console.warn('No error handling implemented for: ', errorType, message);
      }
    },
    [socket, displayToast, setSelectedProfileId],
  );

  const handleShutdown = useCallback(
    (_: SocketId, { time, reason }: ClientData<'System/Shutdown'>) => {
      displayToast(`Scheduled shutdown ${time.toLocaleString(undefined, dateTimeFormat)}. ${reason}`);
    },
    [displayToast],
  );

  useOnSocket('Profile/UpdatedMany', handleUpdatedManyProfiles);
  useOnSocket('Profile/Updated', handleUpdated);
  useOnSocket('System/Error', handleError);
  useOnSocket('System/Shutdown', handleShutdown);

  return <SocketFeatureContext.Provider value={undefined}>{children}</SocketFeatureContext.Provider>;
});
