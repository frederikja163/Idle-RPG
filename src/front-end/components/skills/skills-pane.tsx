import React, {type FC, useMemo} from 'react';
import {SideTabPane, type Tab} from '@/front-end/components/ui/side-tab-pane/side-tab-pane.tsx';
import {skills} from '@/shared/definition/definition.skills.ts';
import {ActivitiesGrid} from '@/front-end/components/skills/activities-grid.tsx';

export const SkillsPane: FC = React.memo(() => {

  const skillTabs = useMemo(() =>
      skills
        .entries()
        .map(([_, skill], i) => {
          return {
            label: skill.display,
            content: <ActivitiesGrid key={i} skillId={skill.id}/>,
          } as Tab;
        })
        .toArray()
    , []);

  return (
    <SideTabPane title="Skills" tabs={skillTabs}/>
  );
});
