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
} from '@/front-end/state/atoms.tsx';
import { routes } from '@/front-end/router/routes.ts';
import { getMsUntilActionDone, mergeItems, mergeSkills } from '@/front-end/lib/utils.ts';
import { activities, type ActivityDef } from '@/shared/definition/definition-activities';
import type { Timeout } from 'react-number-format/types/types';
import { processActivity } from '@/shared/util/util-activities.ts';
import type { SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import type { ItemId } from '@/shared/definition/schema/types/types-items.ts';
import type { useNavigate } from 'react-router-dom';
import type { DataType, ServerClientEvent } from '@/shared/socket/socket-types.ts';
import { Socket } from '@/shared/socket/socket.ts';
import { clientServerEvent, serverClientEvent } from '@/shared/socket/socket-events.ts';

type ClientSocket = Socket<typeof serverClientEvent, typeof clientServerEvent>;

const SocketFeatureContext = createContext(undefined);

interface Props extends ProviderProps {
  navigate: ReturnType<typeof useNavigate>;
}

export const SocketFeatureProvider: FC<Props> = React.memo(function SocketFeatureProvider(props) {
  const { navigate, children } = props;

  const socket = useSocket();

  const resetAtoms = useSetAtom(resetAtomsAtom);
  const setProfiles = useSetAtom(profilesAtom);
  const setActiveActivity = useSetAtom(activeActivityAtom);
  const [profileItems, setProfileItems] = useAtom(profileItemsAtom);
  const [profileSkills, setProfileSkills] = useAtom(profileSkillsAtom);

  const [actionTimeoutId, setActionTimeoutId] = useState<Timeout>();
  const [actionIntervalId, setActionIntervalId] = useState<Timeout>();

  const clearTimeouts = useCallback(() => {
    clearTimeout(actionTimeoutId);
    clearInterval(actionIntervalId);
  }, [actionIntervalId, actionTimeoutId]);

  const handleUpdateProfiles = useCallback(
    (_: ClientSocket, data: DataType<ServerClientEvent, 'Profile/UpdateProfiles'>) => {
      setProfiles(data.profiles);
    },
    [setProfiles],
  );

  const handleSelectProfileSuccess = useCallback(() => {
    resetAtoms();

    socket?.send('Item/GetItems', {});
    socket?.send('Skill/GetSkills', {});
    socket?.send('Activity/GetActivity', {});

    navigate(routes.game);
  }, [navigate, resetAtoms, socket]);

  const handleUpdateItems = useCallback(
    (_: ClientSocket, data: DataType<ServerClientEvent, 'Item/UpdateItems'>) => {
      setProfileItems(mergeItems(data.items));
    },
    [setProfileItems],
  );

  const handleUpdateSkills = useCallback(
    (_: ClientSocket, data: DataType<ServerClientEvent, 'Skill/UpdateSkills'>) => {
      setProfileSkills(mergeSkills(data.skills));
    },
    [setProfileSkills],
  );

  const handleNoActivity = useCallback(() => {
    clearTimeouts();
    setActiveActivity(undefined);
  }, [clearTimeouts, setActiveActivity]);

  const handleActivityStarted = useCallback(
    (_: ClientSocket, data: DataType<ServerClientEvent, 'Activity/ActivityStarted'>) => {
      setActiveActivity(data);

      const activityDef = activities.get(data.activityId);
      if (activityDef == null) return;

      const msUntilActionDone = getMsUntilActionDone(data.activityId, data.activityStart);

      const activityActionTime = activityDef.time;
      const activityElapsedMs = new Date().getTime() - data.activityStart.getTime();

      clearTimeouts();

      processActivityRef.current(activityDef, activityElapsedMs);
      const timeoutId = setTimeout(() => {
        processActivityRef.current(activityDef, activityActionTime);

        const intervalId = setInterval(() => {
          processActivityRef.current(activityDef, activityActionTime);
        }, activityActionTime);

        setActionIntervalId(intervalId);
      }, msUntilActionDone);

      setActionTimeoutId(timeoutId);
    },
    [clearTimeouts, setActiveActivity],
  );

  const handleActivityStopped = useCallback(
    (_: ClientSocket, data: DataType<ServerClientEvent, 'Activity/ActivityStopped'>) => {
      clearTimeouts();
      setActiveActivity(undefined);

      setProfileSkills(mergeSkills(data.skills));
      setProfileItems(mergeItems(data.items));
    },
    [clearTimeouts, setActiveActivity, setProfileItems, setProfileSkills],
  );

  useOnSocket('Profile/UpdateProfiles', handleUpdateProfiles);
  useOnSocket('Profile/SelectProfileSuccess', handleSelectProfileSuccess);
  useOnSocket('Item/UpdateItems', handleUpdateItems);
  useOnSocket('Skill/UpdateSkills', handleUpdateSkills);
  useOnSocket('Activity/NoActivity', handleNoActivity);
  useOnSocket('Activity/ActivityStarted', handleActivityStarted);
  useOnSocket('Activity/ActivityStopped', handleActivityStopped);

  const getSkill = useCallback(
    (skillId: SkillId) => {
      return {
        ...(profileSkills.get(skillId) ?? {
          skillId,
          xp: 0,
          level: 0,
          profileId: '',
        }),
      };
    },
    [profileSkills],
  );

  const getItem = useCallback(
    (itemId: ItemId) => {
      return {
        ...(profileItems.get(itemId) ?? {
          itemId,
          count: 0,
          index: 0,
          profileId: '',
        }),
      };
    },
    [profileItems],
  );

  const processActivityLocal = useCallback(
    async (activityDef: ActivityDef, activityTimeMs: number) => {
      const now = new Date();
      const start = new Date(now.getTime() - activityTimeMs);

      const { items, skills } = await processActivity(start, now, activityDef, {
        getSkill,
        getItem,
      });

      setProfileSkills(mergeSkills(skills));
      setProfileItems(mergeItems(items));
    },
    [getItem, getSkill, setProfileItems, setProfileSkills],
  );

  const processActivityRef = useRef(processActivityLocal);
  useEffect(() => {
    processActivityRef.current = processActivityLocal;
  }, [processActivityLocal]);

  useEffect(() => clearTimeouts);

  return <SocketFeatureContext.Provider value={undefined}>{children}</SocketFeatureContext.Provider>;
});
