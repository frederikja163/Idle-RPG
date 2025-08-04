import React, { type FC, useMemo } from 'react';
import { Row } from '@/front-end/components/ui/layout/row.tsx';
import { craftingSkillMap } from '@/shared/util/util-crafting-skill-map';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';
import { craftingRecipes as activityDefinitions } from '@/shared/definition/definition-crafting';
import { GatheringActivityCard } from '@/front-end/components/game/skills/activity-card/gathering-activity-card.tsx';
import { ProcessingActivityCard } from '@/front-end/components/game/skills/activity-card/processing-activity-card.tsx';

interface Props {
  skill: Partial<Skill>;
}

export const ActivitiesGrid: FC<Props> = React.memo(function ActivitiesGrid(props) {
  const { skill } = props;

  const activityBoxes = useMemo(
    () =>
      skill.id &&
      craftingSkillMap.get(skill.id)?.map((activityId) => {
        const activityDef = activityDefinitions.get(activityId);
        if (!activityDef) return;

        switch (activityDef.type) {
          case 'gathering':
            return <GatheringActivityCard key={activityId} activityDef={activityDef} skillLevel={skill.level ?? 0} />;
          case 'processing':
            return <ProcessingActivityCard key={activityId} activityDef={activityDef} skillLevel={skill.level ?? 0} />;
          case 'crafting':
            console.error('Crafting does not belong to a skill.');
            return;
          default:
            console.error(`Activity ${activityDef} not yet managed in activity grid.`);
            return;
        }
      }),
    [skill.level, skill.id],
  );

  return <Row className="gap-4 items-start flex-wrap">{activityBoxes}</Row>;
});
