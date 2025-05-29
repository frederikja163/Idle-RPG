import React, { type FC, Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { SideTabPane, type Tab } from '@/front-end/components/ui/side-tab-pane/side-tab-pane.tsx';
import { ActivitiesGrid } from '@/front-end/components/game/skills/activities-grid.tsx';
import { useAtom } from 'jotai';
import { activeActivityAtom, profileItemsAtom, profileSkillsAtom } from '@/front-end/state/atoms.tsx';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { SkillButton } from './skill-button';
import { skills as skillDefinitions } from '@/shared/definition/definition-skills.ts';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import { mergeItems, mergeSkills } from '@/front-end/lib/utils.ts';
import { activities, type ActivityDef } from '@/shared/definition/definition-activities.ts';
import type { Timeout } from 'react-number-format/types/types';
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items.ts';
import { processGatheringActivity, processProcessingActivity } from '@/shared/util/util-activities.ts';

export const SkillsPane: FC = React.memo(function SkillsPane() {
  const socket = useSocket();
  const [activeActivity, setActiveActivity] = useAtom(activeActivityAtom);
  const [profileItems, setProfileItems] = useAtom(profileItemsAtom);
  const [profileSkills, setProfileSkills] = useAtom(profileSkillsAtom);

  const skillTabs = useMemo(
    () =>
      skillDefinitions
        .entries()
        .map(([id, skillDef], i) => {
          const profileSkill: Skill = profileSkills?.get(id) ?? {
            profileId: '',
            skillId: id,
            xp: 0,
            level: 0,
          };

          return {
            content: <ActivitiesGrid key={i} skill={profileSkill} />,
            buttonContent: <SkillButton key={i} name={skillDef.display} skill={profileSkill} />,
          } as Tab;
        })
        .toArray(),
    [profileSkills],
  );

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
  const setSkill = useCallback(
    (skill: Skill) => setProfileSkills((profileSkills) => new Map(profileSkills).set(skill.skillId, skill)),
    [setProfileSkills],
  );
  const setItem = useCallback(
    (item: Item) => setProfileItems((profileItems) => new Map(profileItems).set(item.itemId, item)),
    [setProfileItems],
  );

  const processActivity = useCallback(
    async (activityDef: ActivityDef, activityTimeMs: number) => {
      const now = new Date();
      const start = new Date(now.getTime() - activityTimeMs);

      switch (activityDef.type) {
        case 'gathering':
          return await processGatheringActivity(start, now, activityDef, {
            getSkill,
            getItem,
          });

        case 'processing':
          return await processProcessingActivity(start, now, activityDef, {
            getSkill,
            getItem,
          });
      }
    },
    [getItem, getSkill, setItem, setSkill],
  );

  const processActivityRef = useRef(processActivity);
  useEffect(() => {
    processActivityRef.current = processActivity;
  }, [processActivity]);

  useEffect(() => {
    let actionTimeoutId: Timeout;
    let actionIntervalId: Timeout;

    const clearTimeouts = () => {
      clearTimeout(actionTimeoutId);
      clearInterval(actionIntervalId);
    };

    socket?.send('Skill/GetSkills', {});
    socket?.send('Activity/GetActivity', {});

    socket?.on('Skill/UpdateSkills', (_, data) => setProfileSkills(mergeSkills(data.skills)));

    socket?.on('Activity/NoActivity', () => {
      clearTimeouts();
      setActiveActivity(undefined);
    });

    socket?.on('Activity/ActivityStarted', (_, data) => {
      setActiveActivity(data);

      const activityDef = activities.get(data.activityId);
      if (activityDef == null) return;

      const activityActionTime = activityDef.time;
      const msUntilActionDone =
        activityActionTime - ((new Date().getTime() - data.activityStart.getTime()) % activityActionTime);

      clearTimeouts();

      actionTimeoutId = setTimeout(() => {
        processActivityRef.current(activityDef, activityActionTime);

        actionIntervalId = setInterval(() => {
          processActivityRef.current(activityDef, activityActionTime);
        }, activityActionTime);
      }, msUntilActionDone);
    });

    socket?.on('Activity/ActivityStopped', (_, data) => {
      clearTimeouts();

      // If ActivityStopped is received after ActivityStarted this check is needed to not clear the new activeActivity
      if (data.activityId === activeActivity?.activityId) {
        setActiveActivity(undefined);
      }

      setProfileSkills(mergeSkills(data.skills));
      setProfileItems(mergeItems(data.items));
    });

    return () => {
      clearTimeouts();
    };
  }, [activeActivity?.activityId, setActiveActivity, setProfileItems, setProfileSkills, socket]);

  if (!skillTabs) return;

  return (
    <Suspense fallback="🔃">
      <SideTabPane title="Skills" tabs={skillTabs} />
    </Suspense>
  );
});
