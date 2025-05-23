﻿import React, { type FC, useCallback, useMemo } from 'react';
import { Column } from '@/front-end/components/layout/column.tsx';
import { activities as activityDefinitions } from '@/shared/definition/definition-activities';
import { Image } from '@/front-end/components/ui/image.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { Divider } from '@/front-end/components/ui/divider.tsx';
import { Row } from '@/front-end/components/layout/row.tsx';
import { CirclePlay, Clock } from 'lucide-react';
import { ActivityDetail } from '@/front-end/components/game/skills/activity-detail.tsx';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { useAtomValue } from 'jotai';
import { activeActivityAtom } from '@/front-end/state/atoms.tsx';

interface Props {
  activityId: string;
  skillLevel: number;
}

export const ActivityBox: FC<Props> = React.memo(function ActivityBox(props) {
  const { activityId, skillLevel } = props;

  const socket = useSocket();
  const activeActivity = useAtomValue(activeActivityAtom);

  const activity = useMemo(() => activityDefinitions.get(activityId), [activityId]);

  const isActive = activeActivity?.activityId === activityId;
  const isUnlocked = skillLevel >= (activity?.levelRequirement ?? 0);

  const startActivity = useCallback(() => {
    socket?.send('Activity/StartActivity', { activityId });
  }, [socket, activityId]);

  return (
    <Card
      className={`p-2 w-40 ${isUnlocked ? 'cursor-pointer' : 'opacity-50'}  ${isActive ? 'bg-primary' : 'bg-background'}`}
      onClick={isUnlocked ? startActivity : undefined}>
      <Column className="gap-2 relative">
        {isActive && <CirclePlay size={30} className="absolute right-0" />}
        <Image
          src={`/assets/items/${activity?.resultId}.svg`}
          alt={activity?.resultId ?? 'Not found'}
          className="p-2 aspect-square"
        />
        <Typography className="text-lg">{activity?.display}</Typography>
        <Divider />
        <Row>
          <ActivityDetail
            top={`${Math.round((activity?.time ?? 0) / 1000)}s`}
            bottom={<Clock className="stroke-muted-foreground" />}
          />
          <Divider orientation="vertical" className="my-2" />
          <ActivityDetail top={activity?.xpAmount.toString()} bottom="XP" />
        </Row>
      </Column>
    </Card>
  );
});
