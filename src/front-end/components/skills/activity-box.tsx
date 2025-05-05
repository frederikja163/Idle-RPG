import React, {type FC, useMemo} from 'react';
import {Column} from '@/front-end/components/layout/column.tsx';
import {activity as allActivities} from '@/shared/definition/definition.activity.ts';
import {Image} from '@/front-end/components/ui/image.tsx';
import {Typography} from '@/front-end/components/ui/typography.tsx';
import {Card} from '@/front-end/components/ui/card.tsx';

interface Props {
  activityId: string;
}

export const ActivityBox: FC<Props> = React.memo((props) => {
  const {activityId} = props;

  const activity = useMemo(() => allActivities.get(activityId), [activityId]);

  // TODO: change img path
  return (
    <Card className="p-2 bg-background w-40 h-60">
      <Column>
        <Image src={`/assets/${activityId}.svg`} alt={activityId}/>
        <Typography className="text-lg">{activity?.display}</Typography>
        <Typography className="text-sm text-muted-foreground">Xp: {activity?.xpAmount}</Typography>
      </Column>
    </Card>
  );
});
