import React, { type FC, useCallback } from 'react';
import { ActivitySlot } from '@/front-end/components/game/skills/activity-card/activity-slot.tsx';
import { Clock } from 'lucide-react';
import { Divider } from '@/front-end/components/ui/divider.tsx';
import { Row } from '@/front-end/components/layout/row.tsx';
import { BasicTooltip } from '@/front-end/components/ui/basic-tooltip.tsx';
import { ItemTooltip } from '@/front-end/components/game/item-tooltip.tsx';
import { Image } from '@/front-end/components/ui/image.tsx';
import type { ProcessingActivityDef } from '@/shared/definition/definition-activities.ts';
import { ActivityCard } from '@/front-end/components/game/skills/activity-card/activity-card.tsx';
import { useAtomValue } from 'jotai/index';
import { profileItemsAtom } from '@/front-end/store/atoms.tsx';
import { useSocket } from '@/front-end/providers/socket-provider.tsx';

interface Props {
  activityDef: ProcessingActivityDef;
  skillLevel: number;
}

export const ProcessingActivityCard: FC<Props> = React.memo(function ProcessingActivityCard(props) {
  const { activityDef, skillLevel } = props;

  const socket = useSocket();
  const profileItems = useAtomValue(profileItemsAtom);

  const hasRequiredLevel = skillLevel >= activityDef.skillRequirement.level;
  const hasRequiredItems = (profileItems.get(activityDef.cost.itemId)?.count ?? 0) >= 1;

  const handleStart = useCallback(() => {
    if (!hasRequiredLevel || !hasRequiredItems) return;

    socket?.send('Profile/ActivityReplace', { activityId: activityDef.id });
  }, [activityDef.id, hasRequiredItems, hasRequiredLevel, socket]);

  return (
    <ActivityCard
      activityDef={activityDef}
      handleStart={handleStart}
      className={hasRequiredLevel ? (hasRequiredItems ? 'cursor-pointer' : 'opacity-70') : 'opacity-40'}>
      <Row>
        <ActivitySlot
          top={`${Math.round(activityDef.time / 1000)}s`}
          bottom={<Clock className="stroke-muted-foreground" />}
        />
        <Divider orientation="vertical" className="my-2" />
        <ActivitySlot top={activityDef.xpAmount.toString()} bottom="XP" />
        <Divider orientation="vertical" className="my-2" />
        <Row className={`w-full m-1 rounded-sm ${hasRequiredLevel && !hasRequiredItems ? 'bg-red-300' : ''}`}>
          <BasicTooltip tooltipContent={<ItemTooltip itemId={activityDef.cost.itemId} />}>
            <Image
              src={`${import.meta.env.VITE_BASE_URL}/assets/items/${activityDef.cost.itemId}.svg`}
              alt={activityDef.cost.itemId}
              className="p-1 aspect-square"
            />
          </BasicTooltip>
        </Row>
      </Row>
    </ActivityCard>
  );
});
