import React, { type FC } from 'react';
import { type SkillRequirement } from '@/shared/definition/definition-crafting';
import { nameOf } from '@/frontend/lib/function-utils';
import { Typography } from '@/frontend/components/ui/typography';
import { SkillDef } from '@/shared/definition/definition-skills';
import { useAtomValue } from 'jotai';
import { profileSkillsAtom } from '@/frontend/store/atoms';
import { Card } from '@/frontend/components/ui/card';

interface Props {
  skillRequirements: SkillRequirement[];
}

export const RecipeLockedTooltip: FC<Props> = React.memo((props) => {
  const { skillRequirements } = props;

  const profileSkills = useAtomValue(profileSkillsAtom);

  return (
    <Card className="p-2 flex-col">
      <Typography className="font-bold mb-4">Recipe locked</Typography>
      <Typography className="text-xs opacity-60">Required skill levels</Typography>
      {skillRequirements.map((skillRequirement) => {
        const skillDef = SkillDef.getById(skillRequirement.skill.id);
        if (!skillDef) return;

        const profileSkillLevel = profileSkills.get(skillDef.id)?.level ?? 0;

        return (
          <Typography
            key={skillRequirement.skill.id}
            className={profileSkillLevel < skillRequirement.level ? 'text-red-400' : ''}>
            {skillDef.display} level: {profileSkillLevel} / {skillRequirement.level}
          </Typography>
        );
      })}
    </Card>
  );
});

RecipeLockedTooltip.displayName = nameOf({ RecipeLockedTooltip });
