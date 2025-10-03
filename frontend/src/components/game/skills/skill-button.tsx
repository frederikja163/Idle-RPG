import React, { type FC, useMemo } from 'react';
import { ProgressBar } from '@/frontend/components/ui/progress-bar';
import { Column } from '@/frontend/components/ui/layout/column';
import { Typography } from '@/frontend/components/ui/typography';
import type { Skill } from '@/shared/definition/schema/types/types-skills';
import { xpAccum } from '@/shared/util/util-skills';
import { Image } from '@/frontend/components/ui/image';
import { Row } from '@/frontend/components/ui/layout/row';
import { CirclePlay } from 'lucide-react';
import { useAtomValue } from 'jotai/index';
import { activeActivityAtom } from '@/frontend/store/atoms';
import { BasicTooltip } from '@/frontend/components/ui/basic-tooltip';
import { Card } from '@/frontend/components/ui/card';
import { LabeledText } from '@/frontend/components/ui/labeled-text';
import { CraftingRecipeDef } from '@/shared/definition/definition-crafting';
import { assetsBasePath } from '@/frontend/constants/asset-consts';

interface Props {
  name: string;
  skill: Skill;
}

export const SkillButton: FC<Props> = React.memo(function SkillButton(props) {
  const { name, skill } = props;

  const activeActivity = useAtomValue(activeActivityAtom);

  const activeActivityId = useMemo(() => {
    if (activeActivity?.type === 'crafting') return activeActivity.recipeId;

    return undefined;
  }, [activeActivity]);

  const activeRecipe = useMemo(
    () => (activeActivityId ? CraftingRecipeDef.getById(activeActivityId) : undefined),
    [activeActivityId],
  );

  const isActiveSkill = useMemo(
    () => activeRecipe && activeRecipe.getSkillRequirements().some((s) => s.skill.id == skill.id),
    [activeRecipe, skill.id],
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
        <Image src={`${assetsBasePath}skills/${skill.id}.svg`} alt={skill.id} />
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
