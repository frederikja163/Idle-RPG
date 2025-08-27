import React, { type FC, useMemo } from 'react';
import { SideTabPane, type Tab } from '@/frontend/components/ui/side-tab-pane/side-tab-pane';
import { useAtomValue } from 'jotai';
import { profileSkillsAtom, selectedSkillTabAtom } from '@/frontend/store/atoms';
import { SkillButton } from './skill-button';
import { skills as skillDefinitions } from '@/shared/definition/definition-skills';
import type { SkillId } from '@/shared/definition/schema/types/types-skills';
import { RecipesGrid } from '@/frontend/components/game/skills/recipes-grid';

const skillTabIndexMap = new Map<SkillId, number>([
  ['Mining', 0],
  ['Lumberjacking', 1],
  ['Crafting', 2],
]);

export const SkillsPane: FC = React.memo(function SkillsPane() {
  const profileSkills = useAtomValue(profileSkillsAtom);
  const selectedSkillTab = useAtomValue(selectedSkillTabAtom);

  const skillTabs = useMemo(
    () =>
      skillDefinitions
        .entries()
        .map(([id, skillDef]) => {
          const profileSkill = {
            profileId: '',
            id,
            xp: 0,
            level: 0,
            ...profileSkills?.get(id),
          };

          return {
            content: <RecipesGrid key={id} skill={profileSkill} />,
            buttonContent: <SkillButton key={id} name={skillDef.display} skill={profileSkill} />,
          } as Tab;
        })
        .toArray(),
    [profileSkills],
  );

  if (!skillTabs) return;

  return (
    <SideTabPane title="Skills" tabs={skillTabs} collapsable initialTabIndex={skillTabIndexMap.get(selectedSkillTab)} />
  );
});
