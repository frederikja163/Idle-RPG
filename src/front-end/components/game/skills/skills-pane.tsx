import React, {type FC, useEffect} from 'react';
import {SideTabPane, type Tab} from '@/front-end/components/ui/side-tab-pane/side-tab-pane.tsx';
import {skills} from '@/shared/definition/definition-skills';
import {ActivitiesGrid} from '@/front-end/components/game/skills/activities-grid.tsx';
import {useSetAtom} from 'jotai';
import {activeActivityAtom} from '@/front-end/state/atoms.tsx';
import {useSocket} from '@/front-end/state/socket-provider.tsx';

export const SkillsPane: FC = React.memo(function SkillsPane() {
  const socket = useSocket();
  const setActiveActivity = useSetAtom(activeActivityAtom);

  const skillTabs = skills
  .entries()
  .map(([_, skill], i) => {
    return {
      label: skill.display,
      content: <ActivitiesGrid key={i} skillId={skill.id}/>,
    } as Tab;
  })
  .toArray();

  useEffect(() => {
    socket?.send('Activity/GetActivity', {});

    socket?.on('Activity/ActivityStarted', (socket, data) => setActiveActivity(data));
  }, []);

  return <SideTabPane title="Skills" tabs={skillTabs}/>;
});
