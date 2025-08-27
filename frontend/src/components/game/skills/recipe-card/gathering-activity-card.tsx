// import React, { type FC, useCallback } from 'react';
// import { RecipeCardSlot } from '@/frontend/components/game/skills/recipe-card/recipe-card-slot';
// import { Clock } from 'lucide-react';
// import { Divider } from '@/frontend/components/ui/layout/divider';
// import { Row } from '@/frontend/components/ui/layout/row';
// import type { GatheringActivityDef } from '@/shared/definition/definition-crafting';
// import { ActivityCard } from '@/frontend/components/game/skills/recipe-card/recipe-card';
// import { useSocket } from '@/frontend/providers/socket-provider';
//
// interface Props {
//   activityDef: GatheringActivityDef;
//   skillLevel: number;
// }
//
// export const GatheringActivityCard: FC<Props> = React.memo(function GatheringActivityCard(props) {
//   const { activityDef, skillLevel } = props;
//
//   const socket = useSocket();
//
//   const hasRequiredLevel = skillLevel >= activityDef.skillRequirement.level;
//
//   const handleStart = useCallback(() => {
//     if (!hasRequiredLevel) return;
//
//     socket?.send('Profile/ActivityReplace', { activityId: activityDef.id });
//   }, [activityDef.id, hasRequiredLevel, socket]);
//
//   return (
//     <ActivityCard
//       activityDef={activityDef}
//       handleStart={handleStart}
//       className={hasRequiredLevel ? 'cursor-pointer' : 'opacity-40'}>
//       <Row>
//         <RecipeCardSlot
//           top={`${Math.round(activityDef.time / 1000)}s`}
//           bottom={<Clock className="stroke-muted-foreground" />}
//         />
//         <Divider orientation="vertical" className="my-2" />
//         <RecipeCardSlot top={activityDef.xpAmount.toString()} bottom="XP" />
//       </Row>
//     </ActivityCard>
//   );
// });
