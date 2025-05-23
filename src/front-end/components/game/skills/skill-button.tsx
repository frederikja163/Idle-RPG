import React, { type FC, useMemo } from 'react';
import { ProgressBar } from '@/front-end/components/ui/progress-bar.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';
import { xpAccum } from '@/shared/util/util-skills.ts';
import { Image } from '@/front-end/components/ui/image.tsx';
import { Row } from '@/front-end/components/layout/row.tsx';

interface Props {
  skill: Skill;
}

export const SkillButton: FC<Props> = React.memo(function SkillButton(props) {
  const { skill } = props;

  const targetXp = useMemo(() => xpAccum.at(skill.level + 1) ?? skill.xp, [skill.level, skill.xp]);

  return (
    <Column className="mt-2 items-center">
      <Row className="w-1/2">
        <Image src={`/assets/skills/${skill.skillId}.svg`} alt={skill.skillId} />
      </Row>
      <Typography className="text-sm">Level {skill.level}</Typography>
      <ProgressBar value={skill.xp} max={targetXp} />
      <Typography className="text-xs text-muted-foreground">{`${skill.xp} / ${targetXp} XP`}</Typography>
    </Column>
  );
});
