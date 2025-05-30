import React, { type FC, useMemo } from 'react';
import { Row } from '@/front-end/components/layout/row.tsx';
import { activitySkillMap } from '@/shared/util/util-activity-skill-map.ts';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';
import { activities as activityDefinitions } from '@/shared/definition/definition-activities.ts';
import { GatheringActivityCard } from '@/front-end/components/game/skills/activity-card/gathering-activity-card.tsx';
import { ProcessingActivityCard } from '@/front-end/components/game/skills/activity-card/processing-activity-card.tsx';

interface Props {
  skill: Skill;
}

export const ActivitiesGrid: FC<Props> = React.memo(function ActivitiesGrid(props) {
  const { skill } = props;

  const activityBoxes = useMemo(
    () =>
      activitySkillMap.get(skill.skillId)?.map((activityId, i) => {
        const activityDef = activityDefinitions.get(activityId);
        if (!activityDef) return;

        switch (activityDef.type) {
          case 'gathering':
            return <GatheringActivityCard key={i} activityDef={activityDef} skillLevel={skill.level} />;
          case 'processing':
            return <ProcessingActivityCard key={i} activityDef={activityDef} skillLevel={skill.level} />;
          case 'crafting':
            console.error('Crafting does not belong to a skill.');
            return;
          default:
            console.error(`Activity ${activityDef} not yet managed in activity grid.`);
            return;
        }
      }),
    [skill.level, skill.skillId],
  );

  return <Row className="p-6 gap-6 items-start">{activityBoxes}</Row>;
});
