import React, { type FC, useEffect, useMemo } from 'react';
import { Row } from '@/frontend/components/ui/layout/row';
import type { Skill } from '@/shared/definition/schema/types/types-skills';
import {
  type CraftingRecipeDef,
  type CraftingRecipeId,
  craftingRecipes,
} from '@/shared/definition/definition-crafting';
import { GatheringActivityCard } from '@/frontend/components/game/skills/activity-card/gathering-activity-card';
import { ProcessingActivityCard } from '@/frontend/components/game/skills/activity-card/processing-activity-card';

interface Props {
  skill: Partial<Skill>;
}

export const ActivitiesGrid: FC<Props> = React.memo(function ActivitiesGrid(props) {
  const { skill } = props;

  useEffect(() => {
    console.log(craftingRecipes);
  });

  const activityBoxes = useMemo(
    () =>
      skill.id &&
      craftingRecipes.entries().map(([id, craftingRecipeDef]: [CraftingRecipeId, CraftingRecipeDef]) => {
        // const activityDef = activityDefinitions.get(activityId);
        // if (!activityDef) return;

        switch (craftingRecipeDef.skillRequirements.at(0)?.skillId) {
          case 'Lumberjacking':
          case 'Mining':
            return <GatheringActivityCard key={id} activityDef={activityDef} skillLevel={skill.level ?? 0} />;
          case 'Crafting':
            return <ProcessingActivityCard key={id} activityDef={activityDef} skillLevel={skill.level ?? 0} />;
          default:
            console.error(`Activity ${'lol indsæt noget her'} not yet managed in activity grid.`);
            return;
        }
      }),
    [skill.level, skill.id],
  );

  return <Row className="gap-4 items-start flex-wrap">{activityBoxes}</Row>;
});
