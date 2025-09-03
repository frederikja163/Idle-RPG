import React, { createContext, type FC, useCallback, useEffect, useRef, useState } from 'react';
import type { ProviderProps } from '@/frontend/types/provider-types';
import { useOnSocket, useSocket } from '@/frontend/providers/socket-provider';
import { useAtom, useSetAtom } from 'jotai/index';
import {
  activeActivityAtom,
  profileItemsAtom,
  profilesAtom,
  profileSkillsAtom,
  resetAtomsAtom,
  selectedProfileIdAtom,
  selectedSkillTabAtom,
} from '@/frontend/store/atoms';
import { routes } from '@/frontend/router/routes';
import { getItem, getMsUntilActionDone, getSkill, updateItems, updateSkills } from '@/frontend/lib/utils';
import {
  type CraftingRecipeDef,
  type CraftingRecipeId,
  craftingRecipes,
} from '@/shared/definition/definition-crafting';
import type { Timeout } from 'react-number-format/types/types';
import { processCrafting } from '@/shared/util/util-crafting';
import type { useNavigate } from 'react-router-dom';
import type { ClientData, SocketId } from '@/shared/socket/socket-types';
import { errorMessages, ErrorType } from '@/shared/socket/socket-errors';
import { useSync } from '@/frontend/hooks/use-sync';
import { arrayToMap } from '@/frontend/lib/array-utils';
import type { Profile } from '@/shared/definition/schema/types/types-profiles';
import { useToast } from './toast-provider';
import { dateTimeNoSeconds } from '@/frontend/constants/date-time-consts';

const SocketFeatureContext = createContext(undefined);

interface Props extends ProviderProps {
  navigate: ReturnType<typeof useNavigate>;
}

export const SocketFeatureProvider: FC<Props> = React.memo(function SocketFeatureProvider(props) {
  const { navigate, children } = props;

  const socket = useSocket();
  const sync = useSync();
  const { displayToast } = useToast();

  const resetAtoms = useSetAtom(resetAtomsAtom);
  const setProfiles = useSetAtom(profilesAtom);
  const setSelectedSkillTab = useSetAtom(selectedSkillTabAtom);
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
    async (craftingRecipe: CraftingRecipeDef, activityTimeMs: number) => {
      const now = new Date();
      const start = new Date(now.getTime() - activityTimeMs);

      const { items, skills } = await processCrafting(start, now, craftingRecipe.id, {
        getSkill: getSkill(profileSkillsRef.current),
        getItem: getItem(profileItemsRef.current),
      });

      setProfileSkills(updateSkills(skills));
      setProfileItems(updateItems(items));
    },
    [setProfileItems, setProfileSkills],
  );

  const startActivity = useCallback(
    (activityId: CraftingRecipeId, activityStart: Date) => {
      setActiveActivity({ activityId, activityStart });

      const activityDef = craftingRecipes.get(activityId);
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
    (_: SocketId, { profiles }: ClientData<'Profile/UpdatedMany'>) => {
      setProfiles(arrayToMap(profiles as Profile[], 'id'));
    },
    [setProfiles],
  );

  const handleProfileUpdated = useCallback(
    async (_: SocketId, { profile, items, skills }: ClientData<'Profile/Updated'>) => {
      if (profile && profile.id && profile.id != selectedProfileId) {
        resetAtoms();
        clearTimeouts();
        setSelectedProfileId(profile.id);

        socket?.send('Profile/Query', {
          profile: { activity: true },
          items: { index: true, count: true, id: true },
          skills: { xp: true, level: true, id: true },
        });

        navigate(routes.game);
        return;
      }

      if (items) setProfileItems(updateItems(items));
      if (skills) setProfileSkills(updateSkills(skills));
      if (profile && profile.activity) {
        if (profile.activity.type !== 'crafting') return;

        const recipe = craftingRecipes.get(profile.activity.recipeId);
        if (recipe?.id && recipe.skillRequirements.length > 0) {
          const skillId = recipe.skillRequirements[0].skillId;
          setSelectedSkillTab(skillId);
        }

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
      selectedProfileId,
      setProfileItems,
      setProfileSkills,
      resetAtoms,
      clearTimeouts,
      setSelectedProfileId,
      socket,
      navigate,
      setSelectedSkillTab,
      startActivity,
      setActiveActivity,
    ],
  );

  const handlePong = useCallback(() => console.debug('Received pong'), []);

  const handleError = useCallback(
    (_: SocketId, data: ClientData<'Connection/Error'>) => {
      socket?.onError(data.errorType, data.message);

      displayToast(`${errorMessages[data.errorType]} ${data.message ?? ''}`, 'error');

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
    [socket, displayToast, sync, setSelectedProfileId],
  );

  const handleShutdown = useCallback(
    (_: SocketId, data: ClientData<'Connection/Shutdown'>) => {
      displayToast(`Scheduled shutdown ${data.time.toLocaleString(undefined, dateTimeNoSeconds)}. ${data.reason}`);
    },
    [displayToast],
  );

  useOnSocket('Profile/UpdatedMany', handleManyProfilesUpdated);
  useOnSocket('Profile/Updated', handleProfileUpdated);
  useOnSocket('Connection/Pong', handlePong);
  useOnSocket('Connection/Shutdown', handleShutdown);
  useOnSocket('Connection/Error', handleError);

  return <SocketFeatureContext.Provider value={undefined}>{children}</SocketFeatureContext.Provider>;
});
