import React, { type FC, Suspense, useEffect, useMemo, useState } from 'react';
import { SideTabPane, type Tab } from '@/front-end/components/ui/side-tab-pane/side-tab-pane.tsx';
import { ActivitiesGrid } from '@/front-end/components/game/skills/activities-grid.tsx';
import { useSetAtom } from 'jotai';
import { activeActivityAtom } from '@/front-end/state/atoms.tsx';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { SkillButton } from './skill-button';
import { skills as skillDefinitions } from '@/shared/definition/definition-skills.ts';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';

export const SkillsPane: FC = React.memo(function SkillsPane() {
  const socket = useSocket();
  const setActiveActivity = useSetAtom(activeActivityAtom);

  const [profileSkills, setProfileSkills] = useState<Skill[]>();

  const skillTabs = useMemo(
    () =>
      skillDefinitions
        .entries()
        .map(([id, skillDef], i) => {
          const profileSkill: Skill = profileSkills?.find((skill) => skill.skillId === id) ?? {
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

  useEffect(() => {
    socket?.send('Skill/GetSkills', {});
    socket?.send('Activity/GetActivity', {});

    socket?.on('Activity/ActivityStarted', (_, data) => setActiveActivity(data));
    socket?.on('Skill/UpdateSkills', (_, data) => setProfileSkills(data.skills));
  }, [setActiveActivity, socket]);

  if (!skillTabs) return;

  return (
    <Suspense fallback="🔃">
      <SideTabPane title="Skills" tabs={skillTabs} />
    </Suspense>
  );
});
