import React, { type FC, useCallback } from 'react';
import { Column } from '@/front-end/components/layout/column.tsx';
import { type ProcessingActivityDef } from '@/shared/definition/definition-activities';
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
import type { ItemId } from '@/shared/definition/schema/types/types-items';
import type { Item } from '@/shared/definition/schema/types/types-items.ts';
import { BasicTooltip } from '@/front-end/components/ui/basic-tooltip.tsx';
import { ItemTooltip } from '@/front-end/components/game/item-tooltip.tsx';

interface Props {
  activityDef: ProcessingActivityDef;
  skillLevel: number;
}

export const ProcessingActivityBox: FC<Props> = React.memo(function ProcessingActivityBox(props) {
  const { activityDef, skillLevel } = props;

  const socket = useSocket();
  const activeActivity = useAtomValue(activeActivityAtom);
  const profileItems = new Map<ItemId, Item>(); // TODO: change to use atom when that branch is merged in

  const isActive = activeActivity?.activityId === activityDef.id;
  const isUnlocked = skillLevel >= activityDef.levelRequirement;
  const hasRequiredItems = (profileItems.get(activityDef.costId)?.count ?? 0) >= 1;

  const handleClick = useCallback(() => {
    if (isActive) {
      socket?.send('Activity/StopActivity', { activityId: activityDef.id });
      return;
    }

    if (!hasRequiredItems) return;

    socket?.send('Activity/StartActivity', { activityId: activityDef.id });
  }, [activityDef.id, hasRequiredItems, isActive, socket]);

  return (
    <Card
      className={`p-2 w-48 ${isUnlocked ? (hasRequiredItems ? 'cursor-pointer' : 'opacity-70') : 'opacity-40'}  ${isActive ? 'bg-primary' : 'bg-background'}`}
      onClick={isUnlocked ? handleClick : undefined}>
      <Column className="gap-2 relative">
        {isActive && <CirclePlay size={30} className="absolute right-0" />}
        <Image
          src={`/assets/items/${activityDef.resultId}.svg`}
          alt={activityDef.resultId}
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
          <Divider orientation="vertical" className="my-2" />
          <Row className={`w-full m-1 rounded-sm ${isUnlocked && !hasRequiredItems ? 'bg-red-300' : ''}`}>
            <BasicTooltip tooltipContent={<ItemTooltip itemId={activityDef.costId} />}>
              <Image
                src={`/assets/items/${activityDef.costId}.svg`}
                alt={activityDef.costId}
                className="p-1 aspect-square"
              />
            </BasicTooltip>
          </Row>
        </Row>
      </Column>
    </Card>
  );
});
