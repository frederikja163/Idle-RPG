import React, {type FC, useMemo} from 'react';
import {Column} from '@/front-end/components/layout/column.tsx';
import {activity as allActivities} from '@/shared/definition/definition.activity.ts';
import {Image} from '@/front-end/components/ui/image.tsx';
import {Typography} from '@/front-end/components/ui/typography.tsx';
import {Card} from '@/front-end/components/ui/card.tsx';
import {Divider} from "@/front-end/components/ui/divider.tsx";
import {Row} from "@/front-end/components/layout/row.tsx";
import {Clock} from "lucide-react";
import {ActivityDetail} from "@/front-end/components/game/skills/activity-detail.tsx";
import {BasicTooltip} from "@/front-end/components/ui/basic-tooltip.tsx";
import {ItemTooltip} from "@/front-end/components/game/item-tooltip.tsx";

interface Props {
  activityId: string;
}

export const ActivityBox: FC<Props> = React.memo((props) => {
  const {activityId} = props;

  const activity = useMemo(() => allActivities.get(activityId), [activityId]);

  return (
    <Card className="p-2 bg-background w-40 h-60">
      <Column>
        <Image src={`/ass ets/${activityId}.svg`} alt={activityId}/>
        <Typography className="text-lg">{activity?.display}</Typography>
        <Divider/>
        <Row>
          <ActivityDetail top={`${Math.round((activity?.time ?? 0) / 1000)}s`}
                          bottom={<Clock className="stroke-muted-foreground"/>}/>
          <Divider orientation="vertical" className="my-2"/>
          <ActivityDetail top={activity?.xpAmount.toString()} bottom="XP"/>
          <Divider orientation="vertical" className="my-2"/>
          {activity?.resultId && <ActivityDetail top="1" bottom={
            <BasicTooltip tooltipContent={<ItemTooltip itemId={activity?.resultId}/>}>
              <Image src={`/assets/items/${activity?.resultId}.svg`} alt={activity?.resultId ?? "Activity not found"}/>
            </BasicTooltip>
          }/>}
        </Row>
      </Column>
    </Card>
  );
});
