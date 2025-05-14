import React, { type FC, useMemo } from 'react';
import { ProgressBar } from '@/front-end/components/ui/progress-bar.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';
import { xpAccum, xpToReachNext } from '@/shared/util/util-skills.ts';

interface Props {
  skill: Skill;
}

export const SkillButton: FC<Props> = React.memo(function SkillButton(props) {
  const { skill } = props;

  const skillXp = useMemo(
    () => (skill.level === 0 ? skill.xp : skill.xp - xpAccum[skill.level - 1]),
    [skill.level, skill.xp],
  );
  const targetXp = useMemo(() => xpToReachNext(skill.level), [skill.level]);

  return (
    <Column className="mt-2">
      <Typography className="text-sm">Level {skill.level}</Typography>
      <ProgressBar value={skillXp} max={targetXp} />
      <Typography className="text-xs text-muted-foreground">{`${skillXp} / ${targetXp} XP`}</Typography>
    </Column>
  );
});
