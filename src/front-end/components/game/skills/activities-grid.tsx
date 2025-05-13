import React, { type FC } from 'react';
import { Row } from '@/front-end/components/layout/row.tsx';
import { activitySkillMap } from '@/shared/util/util-activity-skill-map.ts';
import { ActivityBox } from '@/front-end/components/game/skills/activity-box.tsx';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';

interface Props {
  skill: Skill;
}

export const ActivitiesGrid: FC<Props> = React.memo(function ActivitiesGrid(props) {
  const { skill } = props;

  return (
    <Row className="p-6 gap-6">
      {activitySkillMap
        .get(skill.skillId)
        ?.map((activityId, i) => <ActivityBox key={i} activityId={activityId} skillLevel={skill.level} />)}
    </Row>
  );
});
