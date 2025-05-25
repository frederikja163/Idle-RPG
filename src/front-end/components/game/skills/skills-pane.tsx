import React, { type FC, Suspense, useEffect, useMemo } from 'react';
import { SideTabPane, type Tab } from '@/front-end/components/ui/side-tab-pane/side-tab-pane.tsx';
import { ActivitiesGrid } from '@/front-end/components/game/skills/activities-grid.tsx';
import { useAtom, useSetAtom } from 'jotai';
import { activeActivityAtom, profileItemsAtom, profileSkillsAtom } from '@/front-end/state/atoms.tsx';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { SkillButton } from './skill-button';
import { skills as skillDefinitions } from '@/shared/definition/definition-skills.ts';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';
import { mergeItems, mergeSkills } from '@/front-end/lib/utils.ts';

export const SkillsPane: FC = React.memo(function SkillsPane() {
  const socket = useSocket();
  const setActiveActivity = useSetAtom(activeActivityAtom);
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
            label: skillDef.display,
            content: <ActivitiesGrid key={i} skill={profileSkill} />,
            buttonContent: <SkillButton key={i} skill={profileSkill} />,
          } as Tab;
        })
        .toArray(),
    [profileSkills],
  );

  useEffect(() => {
    socket?.send('Skill/GetSkills', {});
    socket?.send('Activity/GetActivity', {});

    socket?.on('Activity/ActivityStarted', (_, data) => setActiveActivity(data));
    socket?.on('Activity/ActivityStopped', (_, data) => {
      setActiveActivity(undefined);

      setProfileSkills(mergeSkills(profileSkills, data.skills));
      setProfileItems(mergeItems(profileItems, data.items));
    });
    socket?.on('Activity/NoActivity', () => setActiveActivity(undefined));
    socket?.on('Skill/UpdateSkills', (_, data) => setProfileSkills(mergeSkills(profileSkills, data.skills)));
  }, [profileItems, profileSkills, setActiveActivity, setProfileItems, setProfileSkills, socket]);

  if (!skillTabs) return;

  return (
    <Suspense fallback="🔃">
      <SideTabPane title="Skills" tabs={skillTabs} />
    </Suspense>
  );
});
