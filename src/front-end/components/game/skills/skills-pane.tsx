import React, { type FC, Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { SideTabPane, type Tab } from '@/front-end/components/ui/side-tab-pane/side-tab-pane.tsx';
import { ActivitiesGrid } from '@/front-end/components/game/skills/activities-grid.tsx';
import { useAtom, useSetAtom } from 'jotai';
import { activeActivityAtom, profileItemsAtom, profileSkillsAtom } from '@/front-end/state/atoms.tsx';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { SkillButton } from './skill-button';
import { skills as skillDefinitions } from '@/shared/definition/definition-skills.ts';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import { mergeItems, mergeSkills } from '@/front-end/lib/utils.ts';
import { activities, type ActivityDef } from '@/shared/definition/definition-activities.ts';
import type { Timeout } from 'react-number-format/types/types'; // Or simply `number` if that's what NodeJS.Timeout is
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items.ts';
import { proccessGatheringActivity, processProcessingActivity } from '@/shared/util/util-activities.ts';
import type { ActivityData } from '@/shared/comm-types/index.ts';

// FrontEndProfile class is defined outside, which is good.
// We are not directly using it in this refined version for simplicity,
// but it could be integrated if its batching is strictly needed.
// class FrontEndProfile implements ProfileInterface { ... }

export const SkillsPane: FC = React.memo(function SkillsPane() {
  const socket = useSocket();
  const setActiveActivity = useSetAtom(activeActivityAtom);
  const [profileItems, setProfileItemsAtom] = useAtom(profileItemsAtom); // Use a different name to avoid conflict if needed
  const [profileSkills, setProfileSkillsAtom] = useAtom(profileSkillsAtom); // Use a different name

  const skillTabs = useMemo(
    () =>
      skillDefinitions
        .entries()
        .map(([id, skillDef], i) => {
          const profileSkill: Skill = profileSkills?.get(id) ?? {
            profileId: '', // Consider if profileId is available/needed here
            skillId: id,
            xp: 0,
            level: 0,
          };
          return {
            content: <ActivitiesGrid key={id} skill={profileSkill} />, // Use stable key like id
            buttonContent: <SkillButton key={id} name={skillDef.display} skill={profileSkill} />,
          } as Tab;
        })
        .toArray(),
    [profileSkills],
  );

  const getSkill = useCallback(
    (skillId: SkillId): Skill => {
      return {
        ...(profileSkills.get(skillId) ?? {
          skillId,
          xp: 0,
          level: 0,
          profileId: '', // Consider if profileId is available/needed here
        }),
      };
    },
    [profileSkills],
  );
  // TODO: Remember immutability and the prevoius solution might work
  const getItem = useCallback(
    (itemId: ItemId): Item => {
      return {
        ...(profileItems.get(itemId) ?? {
          itemId,
          count: 0,
          index: 0, // Ensure this default makes sense
          profileId: '', // Consider if profileId is available/needed here
        }),
      };
    },
    [profileItems],
  );

  const setSkill = useCallback(
    (skill: Skill) => setProfileSkillsAtom((prevSkills) => new Map(prevSkills).set(skill.skillId, skill)),
    [setProfileSkillsAtom],
  );

  const setItem = useCallback(
    (item: Item) => setProfileItemsAtom((prevItems) => new Map(prevItems).set(item.itemId, item)),
    [setProfileItemsAtom],
  );

  const processActivity = useCallback(
    async (activityDef: ActivityDef, activityStartISO: string) => {
      // Expect ISO string
      const activityStartDate = new Date(activityStartISO);
      switch (activityDef.type) {
        case 'gathering':
          return await proccessGatheringActivity(activityStartDate, new Date(), activityDef, {
            getSkill,
            getItem,
            setSkill,
            setItem,
          });
        case 'processing':
          return await processProcessingActivity(activityStartDate, new Date(), activityDef, {
            getSkill,
            getItem,
            setSkill,
            setItem,
          });
      }
    },
    [getItem, getSkill, setItem, setSkill], // These are stable if their own deps are stable
  );

  const processActivityRef = useRef(processActivity);
  useEffect(() => {
    processActivityRef.current = processActivity;
  }, [processActivity]);

  useEffect(() => {
    if (!socket) return;

    let actionTimeoutId: Timeout | undefined;
    let actionIntervalId: Timeout | undefined;

    const clearActivityTimers = () => {
      if (actionTimeoutId) clearTimeout(actionTimeoutId);
      if (actionIntervalId) clearInterval(actionIntervalId);
      actionTimeoutId = undefined;
      actionIntervalId = undefined;
    };

    const handleActivityStarted = (_: any, data: ActivityData) => {
      // Use a defined type for 'data'
      setActiveActivity(data);
      clearActivityTimers(); // Clear any previous timers

      const activityDef = activities.get(data.activityId);
      if (activityDef == null) return;

      const activityActionTime = activityDef.time;
      // Ensure data.activityStart is a string (like ISO string) or number for new Date()
      const activityStartDate = new Date(data.activityStart);
      const startTimeMs = activityStartDate.getTime();

      const msUntilActionDone = activityActionTime - ((new Date().getTime() - startTimeMs) % activityActionTime);

      actionTimeoutId = setTimeout(() => {
        processActivityRef.current(activityDef, data.activityStart); // Pass original start time string

        // Clear previous interval just in case, then set new one
        if (actionIntervalId) clearInterval(actionIntervalId);
        actionIntervalId = setInterval(() => {
          processActivityRef.current(activityDef, data.activityStart);
          console.log('Interval 🕹️');
        }, activityActionTime);
      }, msUntilActionDone);
    };

    const handleActivityStopped = (_: any, data: { skills: Skill[]; items: Item[] }) => {
      setActiveActivity(undefined);
      clearActivityTimers();
      // Assuming mergeSkills/Items take arrays and return new Maps or update existing ones correctly
      setProfileSkillsAtom(mergeSkills(data.skills));
      setProfileItemsAtom(mergeItems(data.items));
    };

    const handleNoActivity = () => {
      setActiveActivity(undefined);
      clearActivityTimers();
    };

    const handleUpdateSkills = (_: any, data: { skills: Skill[] }) => {
      setProfileSkillsAtom(mergeSkills(data.skills));
    };

    // Initial data fetch
    socket.send('Skill/GetSkills', {});
    socket.send('Activity/GetActivity', {});

    // Register event listeners
    socket.on('Activity/ActivityStarted', handleActivityStarted);
    socket.on('Activity/ActivityStopped', handleActivityStopped);
    socket.on('Activity/NoActivity', handleNoActivity);
    socket.on('Skill/UpdateSkills', handleUpdateSkills);

    return () => {
      // Cleanup: remove listeners and clear timers
      clearActivityTimers();
    };
    // Dependencies: socket and Jotai setters (which are stable).
    // processActivity is handled by the ref.
    // The handlers (handleActivityStarted, etc.) are defined within this effect's scope.
    // If they were defined outside with useCallback, they'd need to be in the dep array.
  }, [socket, setActiveActivity, setProfileItemsAtom, setProfileSkillsAtom]);

  if (!skillTabs) return null; // Or some other loading/empty state

  return (
    <Suspense fallback="🔃">
      <SideTabPane title="Skills" tabs={skillTabs} />
    </Suspense>
  );
});
