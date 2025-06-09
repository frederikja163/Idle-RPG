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
import { getItem, getMsUntilActionDone, getSkill, updateItems, updateSkills } from '@/front-end/lib/utils.ts';
import { activities, type ActivityDef } from '@/shared/definition/definition-activities';
import type { Timeout } from 'react-number-format/types/types';
import { processActivity } from '@/shared/util/util-activities.ts';
import type { useNavigate } from 'react-router-dom';
import type { ClientData, DataType, ServerClientEvent } from '@/shared/socket/socket-types.ts';
import { ErrorType } from '@/shared/socket/socket-errors.ts';
import { useToast } from '@/front-end/state/toast-provider.tsx';

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
  const setSelectedProfileId = useSetAtom(selectedProfileIdAtom);
  const setActiveActivity = useSetAtom(activeActivityAtom);
  const [profileItems, setProfileItems] = useAtom(profileItemsAtom);
  const [profileSkills, setProfileSkills] = useAtom(profileSkillsAtom);

  const [actionTimeoutId, setActionTimeoutId] = useState<Timeout>();
  const [actionIntervalId, setActionIntervalId] = useState<Timeout>();
  const [updateItemsFinished, setUpdateItemsFinished] = useState(false);
  const [updateSkillsFinished, setUpdateSkillsFinished] = useState(false);

  const profileItemsRef = useRef(profileItems);
  const profileSkillsRef = useRef(profileSkills);

  useEffect(() => {
    profileItemsRef.current = profileItems;
  }, [profileItems]);

  useEffect(() => {
    profileSkillsRef.current = profileSkills;
  }, [profileSkills]);

  useEffect(() => {
    if (!updateItemsFinished || !updateSkillsFinished) return;

    socket?.send('Activity/GetActivity', {});
  }, [socket, updateItemsFinished, updateSkillsFinished]);

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

  const handleUpdateProfiles = useCallback(
    (_: string, data: DataType<ServerClientEvent, 'Profile/UpdateProfiles'>) => {
      setProfiles(data.profiles);
    },
    [setProfiles],
  );

  const handleSelectProfileSuccess = useCallback(async () => {
    resetAtoms();

    setUpdateItemsFinished(false);
    setUpdateSkillsFinished(false);

    socket?.send('Item/GetItems', {});
    socket?.send('Skill/GetSkills', {});

    navigate(routes.game);
  }, [navigate, resetAtoms, socket]);

  // TODO: add to all handlers: ClientData and deconstruct data
  const handleUpdateItems = useCallback(
    (_: string, { items }: ClientData<'Item/UpdateItems'>) => {
      setProfileItems(updateItems(items));
      setUpdateItemsFinished(true);
    },
    [setProfileItems],
  );

  const handleUpdateSkills = useCallback(
    (_: string, data: DataType<ServerClientEvent, 'Skill/UpdateSkills'>) => {
      setProfileSkills(updateSkills(data.skills));
      setUpdateSkillsFinished(true);
    },
    [setProfileSkills],
  );

  const handleNoActivity = useCallback(() => {
    clearTimeouts();
    setActiveActivity(undefined);
  }, [clearTimeouts, setActiveActivity]);

  const handleActivityStarted = useCallback(
    (_: string, data: DataType<ServerClientEvent, 'Activity/ActivityStarted'>) => {
      setActiveActivity(data);

      const activityDef = activities.get(data.activityId);
      if (!activityDef) return;

      const msUntilActionDone = getMsUntilActionDone(data.activityId, data.activityStart);
      const activityActionTime = activityDef.time;

      clearTimeouts();

      const __ = processActivityLocal(activityDef, new Date().getTime() - data.activityStart.getTime());
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

  const handleActivityStopped = useCallback(
    (_: string, data: DataType<ServerClientEvent, 'Activity/ActivityStopped'>) => {
      clearTimeouts();
      setActiveActivity(undefined);
      setProfileSkills(updateSkills(data.skills));
      setProfileItems(updateItems(data.items));
    },
    [clearTimeouts, setActiveActivity, setProfileItems, setProfileSkills],
  );

  const handleError = useCallback(
    (_: string, data: DataType<ServerClientEvent, 'System/Error'>) => {
      socket?.onError(data.errorType, data.message);

      displayToast(data.message ?? data.errorType.toString(), 'error');

      switch (data.errorType) {
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
    [displayToast, setSelectedProfileId, socket],
  );

  useOnSocket('Profile/UpdateProfiles', handleUpdateProfiles);
  useOnSocket('Profile/SelectProfileSuccess', handleSelectProfileSuccess);
  useOnSocket('Item/UpdateItems', handleUpdateItems);
  useOnSocket('Skill/UpdateSkills', handleUpdateSkills);
  useOnSocket('Activity/NoActivity', handleNoActivity);
  useOnSocket('Activity/ActivityStarted', handleActivityStarted);
  useOnSocket('Activity/ActivityStopped', handleActivityStopped);
  useOnSocket('System/Error', handleError);

  return <SocketFeatureContext.Provider value={undefined}>{children}</SocketFeatureContext.Provider>;
});
