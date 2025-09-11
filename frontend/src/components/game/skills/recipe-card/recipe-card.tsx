import React, { type CSSProperties, type FC, useCallback, useEffect, useMemo } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import { type CraftingRecipeDef } from '@/shared/definition/definition-crafting';
import { Image } from '@/frontend/components/ui/image';
import { Typography } from '@/frontend/components/ui/typography';
import { Card } from '@/frontend/components/ui/card';
import { Divider } from '@/frontend/components/ui/layout/divider';
import { CirclePlay, Clock } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { activeActivityAtom } from '@/frontend/store/atoms';
import { motion, useAnimation } from 'framer-motion';
import { useSocket } from '@/frontend/providers/socket-provider';
import { getMsUntilActionDone } from '@/frontend/lib/utils';
import { useWindowSize } from '@/frontend/hooks/use-window-size';
import { Row } from '@/frontend/components/ui/layout/row';
import { nameOf } from '@/frontend/lib/function-utils';
import { RecipeCardSlot } from '@/frontend/components/game/skills/recipe-card/recipe-card-slot';

interface Props {
  recipeDef: CraftingRecipeDef;
  className?: string;
}

export const RecipeCard: FC<Props> = React.memo((props) => {
  const { recipeDef, className } = props;

  const socket = useSocket();
  const { width } = useWindowSize();
  const animationControls = useAnimation();
  const activeActivity = useAtomValue(activeActivityAtom);

  const isActive = false; //activeActivity?.activityId === activityDef.id;
  // const hasRequiredLevel = skillLevel >= activityDef.skillRequirement.level;
  // const hasRequiredItems = (profileItems.get(activityDef.cost.itemId)?.count ?? 0) >= 1;

  const cardWidth = useMemo(() => (width < 1000 ? 'w-30' : 'w-40'), [width]);

  const mainSkill = useMemo(() => recipeDef.skillRequirements.at(0), [recipeDef.skillRequirements]);
  const mainResult = useMemo(() => recipeDef.result.at(0), [recipeDef.result]);

  const handleClick = useCallback(() => {
    if (isActive) {
      socket?.send('Profile/ActivityReplace', { type: 'none' });
      return;
    }

    // if (!hasRequiredLevel || !hasRequiredItems) return;

    // socket?.send('Profile/ActivityReplace', { activityId: activityDef.id });
  }, [isActive, socket]);

  useEffect(() => {
    if (!isActive || !activeActivity) {
      animationControls.stop();
      animationControls.set({ x: '-100%' });
      return;
    }

    const msUntilActionDone = getMsUntilActionDone(activeActivity.activityId, activeActivity.activityStart);
    const startX = `${-100 + Math.round(((recipeDef.time - msUntilActionDone) / recipeDef.time) * 100)}%`;

    animationControls
      .start({
        x: [startX, '0%'],
        transition: {
          duration: msUntilActionDone / 1000,
          ease: 'linear',
        },
      })
      .then(() =>
        animationControls.start({
          x: ['-100%', '0%'],
          transition: {
            duration: recipeDef.time / 1000,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          },
        }),
      );
  }, [activeActivity, animationControls, isActive, recipeDef.time]);

  return (
    <Card
      className={`p-2 bg-background relative overflow-hidden grow ${cardWidth} max-w-40 ${className}`}
      onClick={handleClick}>
      <motion.div
        animate={animationControls}
        className="absolute h-full w-full -m-2 bg-primary"
        style={styles.animatedBackground}
      />
      <Column className="gap-2 relative">
        {isActive && <CirclePlay size={30} className="absolute right-0" />}
        {mainResult && (
          <Image
            src={`${import.meta.env.VITE_BASE_URL}/assets/items/${mainResult.itemId}.svg`}
            alt={mainResult.itemId}
            className="p-6 aspect-square"
          />
        )}
        {/* The min-h-16 below is not the ideal way to make equal heights. Should maybe use grids, but it's a big refactor */}
        <Typography className="min-h-16">{recipeDef.display}</Typography>
        <Divider />
        <Row>
          <RecipeCardSlot
            top={`${Math.round(recipeDef.time / 1000)}s`}
            bottom={<Clock className="stroke-muted-foreground" />}
          />
          <Divider orientation="vertical" className="my-2" />
          <RecipeCardSlot top={mainSkill?.xp} bottom="XP" />
        </Row>
      </Column>
    </Card>
  );
});

const styles: { [key: string]: CSSProperties } = {
  animatedBackground: {
    transform: 'translateX(-100%)',
  },
};

RecipeCard.displayName = nameOf({ RecipeCard });
