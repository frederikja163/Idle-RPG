import React, { type FC, useMemo } from 'react';
import { ProgressBar } from '@/front-end/components/ui/progress-bar.tsx';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';
import { xpAccum } from '@/shared/util/util-skills.ts';
import { Image } from '@/front-end/components/ui/image.tsx';
import { Row } from '@/front-end/components/layout/row.tsx';
import { CirclePlay } from 'lucide-react';
import { useAtomValue } from 'jotai/index';
import { activeActivityAtom } from '@/front-end/state/atoms.tsx';
import { activities } from '@/shared/definition/definition-activities.ts';
import { getActivitySkill } from '@/shared/util/util-activity-skill-map';

interface Props {
  name: string;
  skill: Skill;
}

export const SkillButton: FC<Props> = React.memo(function SkillButton(props) {
  const { name, skill } = props;

  const activeActivityId = useAtomValue(activeActivityAtom)?.activityId;
  const activeActivity = activeActivityId ? activities.get(activeActivityId) : undefined;
  const isActiveSkill = activeActivity && getActivitySkill(activeActivity) === skill.skillId;
  const targetXp = useMemo(() => xpAccum.at(skill.level + 1) ?? skill.xp, [skill.level, skill.xp]);

  return (
    <Column className="mt-2 items-center">
      <Row className="relative items-center">
        {isActiveSkill && <CirclePlay size={16} className="text-primary absolute translate-x-[-20px]" />}
        <Typography>{name}</Typography>
      </Row>
      <Row className="w-1/2">
        <Image src={`${import.meta.env.VITE_BASE_URL}/assets/skills/${skill.skillId}.svg`} alt={skill.skillId} />
      </Row>
      <Typography className="text-sm">Level {skill.level}</Typography>
      <ProgressBar value={skill.xp} max={targetXp} />
      <Typography className="text-xs text-muted-foreground">{`${skill.xp} / ${targetXp} XP`}</Typography>
    </Column>
  );
});
