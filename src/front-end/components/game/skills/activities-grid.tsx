import React, {type FC} from 'react';
import {Row} from '@/front-end/components/layout/row.tsx';
import {activitySkillMap} from '@/shared/util/util-activity-skill-map.ts';
import {ActivityBox} from '@/front-end/components/game/skills/activity-box.tsx';

interface Props {
  skillId: string;
}

export const ActivitiesGrid: FC<Props> = React.memo((props) => {
  const {skillId} = props;

  return (
    <Row className="p-6 gap-6">
      {activitySkillMap.get(skillId)?.map((activityId, i) => <ActivityBox key={i} activityId={activityId}/>)}
    </Row>
  );
});
