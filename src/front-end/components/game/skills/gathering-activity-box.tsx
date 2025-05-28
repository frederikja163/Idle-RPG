import React, { type FC, useCallback } from 'react';
import { Column } from '@/front-end/components/layout/column.tsx';
import { type GatheringActivityDef } from '@/shared/definition/definition-activities';
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
  activityDef: GatheringActivityDef;
  skillLevel: number;
}

export const GatheringActivityBox: FC<Props> = React.memo(function GatheringActivityBox(props) {
  const { activityDef, skillLevel } = props;

  const socket = useSocket();
  const activeActivity = useAtomValue(activeActivityAtom);

  const isActive = activeActivity?.activityId === activityDef.id;
  const isUnlocked = skillLevel >= activityDef.skillRequirement.level;

  const handleClick = useCallback(() => {
    if (isActive) {
      socket?.send('Activity/StopActivity', { activityId: activityDef.id });
      return;
    }

    socket?.send('Activity/StartActivity', { activityId: activityDef.id });
  }, [activityDef.id, isActive, socket]);

  return (
    <Card
      className={`p-2 w-48 ${isUnlocked ? 'cursor-pointer' : 'opacity-50'}  ${isActive ? 'bg-primary' : 'bg-background'}`}
      onClick={isUnlocked ? handleClick : undefined}>
      <Column className="gap-2 relative">
        {isActive && <CirclePlay size={30} className="absolute right-0" />}
        <Image
          src={`/assets/items/${activityDef.result.itemId}.svg`}
          alt={activityDef.result.itemId}
          className="p-6 aspect-square"
        />
        <Typography className="text-lg">{activityDef.display}</Typography>
        <Divider />
        <Row>
          <ActivityDetail
            top={`${Math.round(activityDef.time / 1000)}s`}
            bottom={<Clock className="stroke-muted-foreground" />}
          />
          <Divider orientation="vertical" className="my-2" />
          <ActivityDetail top={activityDef.xpAmount.toString()} bottom="XP" />
        </Row>
      </Column>
    </Card>
  );
});
