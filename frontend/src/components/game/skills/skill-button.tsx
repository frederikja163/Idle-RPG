import React, { type FC, useMemo } from 'react';
import { ProgressBar } from '@/front-end/components/ui/progress-bar.tsx';
import { Column } from '@/front-end/components/ui/layout/column.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';
import { xpAccum } from '@/shared/util/util-skills.ts';
import { Image } from '@/front-end/components/ui/image.tsx';
import { Row } from '@/front-end/components/ui/layout/row.tsx';
import { CirclePlay } from 'lucide-react';
import { useAtomValue } from 'jotai/index';
import { activeActivityAtom } from '@/front-end/store/atoms.tsx';
import { craftingRecipes } from '@/shared/definition/definition-crafting';
import { BasicTooltip } from '@/front-end/components/ui/basic-tooltip.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { LabeledText } from '@/front-end/components/ui/labeled-text.tsx';

interface Props {
  name: string;
  skill: Skill;
}

export const SkillButton: FC<Props> = React.memo(function SkillButton(props) {
  const { name, skill } = props;

  const activeActivityId = useAtomValue(activeActivityAtom)?.activityId;
  const activeActivity = useMemo(
    () => (activeActivityId ? craftingRecipes.get(activeActivityId) : undefined),
    [activeActivityId],
  );
  const isActiveSkill = useMemo(
    () => activeActivity && activeActivity.skillRequirements.length > 0 && activeActivity.skillRequirements[0].skillId === skill.id,
    [activeActivity, skill.id],
  );

  const targetXp = xpAccum.at(skill.level + 1) ?? skill.xp;
  const currentLevelXp = skill.xp - (xpAccum.at(skill.level) ?? 0);
  const currentTargetXp = targetXp - (xpAccum.at(skill.level) ?? 0);

  const toolTip = useMemo(
    () => (
      <Card>
        <Column className="p-2 gap-2">
          <LabeledText label="Total XP" text={skill.xp.toString()} />
          <LabeledText label="XP for level up" text={targetXp.toString()} />
        </Column>
      </Card>
    ),
    [skill.xp, targetXp],
  );

  return (
    <Column className="mt-2 items-center">
      <Row className="relative items-center">
        {isActiveSkill && <CirclePlay size={16} className="text-primary absolute translate-x-[-20px]" />}
        <Typography>{name}</Typography>
      </Row>
      <Row className="w-1/2">
        <Image src={`${import.meta.env.VITE_BASE_URL}/assets/skills/${skill.id}.svg`} alt={skill.id} />
      </Row>
      <BasicTooltip tooltipContent={toolTip} disableHoverableContent>
        <Column className="w-full">
          <Typography className="text-sm">Level {skill.level}</Typography>
          <ProgressBar value={currentLevelXp} max={currentTargetXp} />
        </Column>
      </BasicTooltip>
    </Column>
  );
});
