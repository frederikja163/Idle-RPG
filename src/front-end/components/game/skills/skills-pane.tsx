import React, { type FC, Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { SideTabPane, type Tab } from '@/front-end/components/ui/side-tab-pane/side-tab-pane.tsx';
import { ActivitiesGrid } from '@/front-end/components/game/skills/activities-grid.tsx';
import { useAtom } from 'jotai';
import {
  activeActivityAtom,
  activityProgressPercentAtom,
  profileItemsAtom,
  profileSkillsAtom,
} from '@/front-end/state/atoms.tsx';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { SkillButton } from './skill-button';
import { skills as skillDefinitions } from '@/shared/definition/definition-skills.ts';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import { mergeItems, mergeSkills } from '@/front-end/lib/utils.ts';
import { activities, type ActivityDef } from '@/shared/definition/definition-activities.ts';
import type { Timeout } from 'react-number-format/types/types';
import type { ItemId } from '@/shared/definition/schema/types/types-items.ts';
import { processActivity } from '@/shared/util/util-activities.ts';
import { useSetAtom } from 'jotai/index';

export const SkillsPane: FC = React.memo(function SkillsPane() {
  const socket = useSocket();
  const [activeActivity, setActiveActivity] = useAtom(activeActivityAtom);
  const [profileItems, setProfileItems] = useAtom(profileItemsAtom);
  const [profileSkills, setProfileSkills] = useAtom(profileSkillsAtom);
  const setActivityProgressPercent = useSetAtom(activityProgressPercentAtom);

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

  const processActivityLocal = useCallback(
    async (activityDef: ActivityDef, activityTimeMs: number) => {
      setActivityProgressPercent(undefined);

      const now = new Date();
      const start = new Date(now.getTime() - activityTimeMs);

      const { items, skills } = await processActivity(start, now, activityDef, {
        getSkill,
        getItem,
      });

      setProfileSkills(mergeSkills(skills));
      setProfileItems(mergeItems(items));
    },
    [getItem, getSkill, setActivityProgressPercent, setProfileItems, setProfileSkills],
  );

  const processActivityRef = useRef(processActivityLocal);
  useEffect(() => {
    processActivityRef.current = processActivityLocal;
  }, [processActivityLocal]);

  useEffect(() => {
    socket?.send('Skill/GetSkills', {});
  }, [socket]);

  useEffect(() => {
    let actionTimeoutId: Timeout;
    let actionIntervalId: Timeout;

    const clearTimeouts = () => {
      clearTimeout(actionTimeoutId);
      clearInterval(actionIntervalId);
    };

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
      const activityElapsedMs = new Date().getTime() - data.activityStart.getTime();
      const actionElapsedMs = activityElapsedMs % activityActionTime;
      const progressPercent = (actionElapsedMs / activityActionTime) * 100;
      const msUntilActionDone = activityActionTime - actionElapsedMs;
      setActivityProgressPercent(progressPercent);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!skillTabs) return;

  return (
    <Suspense fallback="🔃">
      <SideTabPane title="Skills" tabs={skillTabs} />
    </Suspense>
  );
});
