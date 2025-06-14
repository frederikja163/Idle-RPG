import React, { type FC, useCallback } from 'react';
import { ActivitySlot } from '@/front-end/components/game/skills/activity-card/activity-slot.tsx';
import { Clock } from 'lucide-react';
import { Divider } from '@/front-end/components/ui/divider.tsx';
import { Row } from '@/front-end/components/layout/row.tsx';
import type { GatheringActivityDef } from '@/shared/definition/definition-activities.ts';
import { ActivityCard } from '@/front-end/components/game/skills/activity-card/activity-card.tsx';
import { useSocket } from '@/front-end/state/providers/socket-provider.tsx';

interface Props {
  activityDef: GatheringActivityDef;
  skillLevel: number;
}

export const GatheringActivityCard: FC<Props> = React.memo(function GatheringActivityCard(props) {
  const { activityDef, skillLevel } = props;

  const socket = useSocket();

  const hasRequiredLevel = skillLevel >= activityDef.skillRequirement.level;

  const handleStart = useCallback(() => {
    if (!hasRequiredLevel) return;

    socket?.send('Profile/ActivityReplace', { activityId: activityDef.id });
  }, [activityDef.id, hasRequiredLevel, socket]);

  return (
    <ActivityCard
      activityDef={activityDef}
      handleStart={handleStart}
      className={hasRequiredLevel ? 'cursor-pointer' : 'opacity-40'}>
      <Row>
        <ActivitySlot
          top={`${Math.round(activityDef.time / 1000)}s`}
          bottom={<Clock className="stroke-muted-foreground" />}
        />
        <Divider orientation="vertical" className="my-2" />
        <ActivitySlot top={activityDef.xpAmount.toString()} bottom="XP" />
      </Row>
    </ActivityCard>
  );
});
