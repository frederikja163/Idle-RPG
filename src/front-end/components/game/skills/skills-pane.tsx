import React, { type FC, useMemo } from 'react';
import { SideTabPane, type Tab } from '@/front-end/components/ui/side-tab-pane/side-tab-pane.tsx';
import { ActivitiesGrid } from '@/front-end/components/game/skills/activities-grid.tsx';
import { useAtomValue } from 'jotai';
import { profileSkillsAtom } from '@/front-end/state/atoms.tsx';
import { SkillButton } from './skill-button';
import { skills as skillDefinitions } from '@/shared/definition/definition-skills.ts';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';

export const SkillsPane: FC = React.memo(function SkillsPane() {
  const profileSkills = useAtomValue(profileSkillsAtom);

  const skillTabs = useMemo(
    () =>
      skillDefinitions
        .entries()
        .map(([id, skillDef]) => {
          const profileSkill: Skill = profileSkills?.get(id) ?? {
            profileId: '',
            skillId: id,
            xp: 0,
            level: 0,
          };

          return {
            content: <ActivitiesGrid key={id} skill={profileSkill} />,
            buttonContent: <SkillButton key={id} name={skillDef.display} skill={profileSkill} />,
          } as Tab;
        })
        .toArray(),
    [profileSkills],
  );

  if (!skillTabs) return;

  return <SideTabPane title="Skills" tabs={skillTabs} collapsable />;
});
