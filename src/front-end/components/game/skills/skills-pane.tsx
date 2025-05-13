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

  const [skills, setSkills] = useState<Skill[]>();

  const skillTabs = useMemo(
    () =>
      skills?.map((skill, i) => {
        return {
          label: skillDefinitions.get(skill.skillId),
          content: <ActivitiesGrid key={i} skillId={skill.skillId} />,
          buttonContent: <SkillButton key={i} skill={skill} />,
        } as Tab;
      }),
    [skills],
  );

  useEffect(() => {
    socket?.send('Skill/GetSkills', {});
    socket?.send('Activity/GetActivity', {});

    socket?.on('Activity/ActivityStarted', (_, data) => setActiveActivity(data));
    socket?.on('Skill/UpdateSkills', (_, data) => setSkills(data.skills));
  }, []);

  if (!skillTabs) return;

  return (
    <Suspense fallback="🔃">
      <SideTabPane title="Skills" tabs={skillTabs} />
    </Suspense>
  );
});
