// import React, { type FC, useCallback } from 'react';
// import { RecipeCardSlot } from '@/frontend/components/game/skills/recipe-card/recipe-card-slot';
// import { Clock } from 'lucide-react';
// import { Divider } from '@/frontend/components/ui/layout/divider';
// import { Row } from '@/frontend/components/ui/layout/row';
// import { BasicTooltip } from '@/frontend/components/ui/basic-tooltip';
// import { ItemTooltip } from '@/frontend/components/game/item-tooltip';
// import { Image } from '@/frontend/components/ui/image';
// import type { ProcessingActivityDef } from '@/shared/definition/definition-crafting';
// import { ActivityCard } from '@/frontend/components/game/skills/recipe-card/recipe-card';
// import { useAtomValue } from 'jotai/index';
// import { profileItemsAtom } from '@/frontend/store/atoms';
// import { useSocket } from '@/frontend/providers/socket-provider';
//
// interface Props {
//   activityDef: ProcessingActivityDef;
//   skillLevel: number;
// }
//
// export const ProcessingActivityCard: FC<Props> = React.memo(function ProcessingActivityCard(props) {
//   const { activityDef, skillLevel } = props;
//
//   const socket = useSocket();
//   const profileItems = useAtomValue(profileItemsAtom);
//
//   const hasRequiredLevel = skillLevel >= activityDef.skillRequirement.level;
//   const hasRequiredItems = (profileItems.get(activityDef.cost.itemId)?.count ?? 0) >= 1;
//
//   const handleStart = useCallback(() => {
//     if (!hasRequiredLevel || !hasRequiredItems) return;
//
//     socket?.send('Profile/ActivityReplace', { activityId: activityDef.id });
//   }, [activityDef.id, hasRequiredItems, hasRequiredLevel, socket]);
//
//   return (
//     <ActivityCard
//       activityDef={activityDef}
//       handleStart={handleStart}
//       className={hasRequiredLevel ? (hasRequiredItems ? 'cursor-pointer' : 'opacity-70') : 'opacity-40'}>
//       <Row>
//         <RecipeCardSlot
//           top={`${Math.round(activityDef.time / 1000)}s`}
//           bottom={<Clock className="stroke-muted-foreground" />}
//         />
//         <Divider orientation="vertical" className="my-2" />
//         <RecipeCardSlot top={activityDef.xpAmount.toString()} bottom="XP" />
//         <Divider orientation="vertical" className="my-2" />
//         <Row className={`w-full m-1 rounded-sm ${hasRequiredLevel && !hasRequiredItems ? 'bg-red-300' : ''}`}>
//           <BasicTooltip tooltipContent={<ItemTooltip itemId={activityDef.cost.itemId} />}>
//             <Image
//               src={`${import.meta.env.VITE_BASE_URL}/assets/items/${activityDef.cost.itemId}.svg`}
//               alt={activityDef.cost.itemId}
//               className="p-1 aspect-square"
//             />
//           </BasicTooltip>
//         </Row>
//       </Row>
//     </ActivityCard>
//   );
// });
