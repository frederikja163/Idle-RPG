import React, { type CSSProperties, type FC, type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import {
  type GatheringActivityDef,
  NoActivity,
  type ProcessingActivityDef,
} from '@/shared/definition/definition-crafting';
import { Image } from '@/frontend/components/ui/image';
import { Typography } from '@/frontend/components/ui/typography';
import { Card } from '@/frontend/components/ui/card';
import { Divider } from '@/frontend/components/ui/layout/divider';
import { CirclePlay } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { activeActivityAtom } from '@/frontend/store/atoms';
import { motion, useAnimation } from 'framer-motion';
import { useSocket } from '@/frontend/providers/socket-provider';
import { getMsUntilActionDone } from '@/frontend/lib/utils';
import { useWindowSize } from '@/frontend/hooks/use-window-size';

interface Props {
  activityDef: GatheringActivityDef | ProcessingActivityDef;
  className?: string;
  handleStart: () => void;
  children: ReactNode;
}

export const ActivityCard: FC<Props> = React.memo(function ActivityCard(props) {
  const { activityDef, className, handleStart, children } = props;

  const socket = useSocket();
  const { width } = useWindowSize();
  const animationControls = useAnimation();
  const activeActivity = useAtomValue(activeActivityAtom);

  const isActive = activeActivity?.activityId === activityDef.id;

  const cardWidth = useMemo(() => (width < 1000 ? 'w-30' : 'w-40'), [width]);

  const handleClick = useCallback(() => {
    if (isActive) {
      socket?.send('Profile/ActivityReplace', { activityId: NoActivity });
      return;
    }

    handleStart();
  }, [handleStart, isActive, socket]);

  useEffect(() => {
    if (!isActive || !activeActivity) {
      animationControls.stop();
      animationControls.set({ x: '-100%' });
      return;
    }

    const msUntilActionDone = getMsUntilActionDone(activeActivity.activityId, activeActivity.activityStart);
    const startX = `${-100 + Math.round(((activityDef.time - msUntilActionDone) / activityDef.time) * 100)}%`;

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
            duration: activityDef.time / 1000,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          },
        }),
      );
  }, [activeActivity, activityDef.time, animationControls, isActive]);

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
        <Image
          src={`${import.meta.env.VITE_BASE_URL}/assets/items/${activityDef.result.itemId}.svg`}
          alt={activityDef.result.itemId}
          className="p-6 aspect-square"
        />
        {/* The min-h-16 below is not the ideal way to make equal heights. Should maybe use grids, but it's a big refactor */}
        <Typography className="min-h-16">{activityDef.display}</Typography>
        <Divider />
        {children}
      </Column>
    </Card>
  );
});

const styles: { [key: string]: CSSProperties } = {
  animatedBackground: {
    transform: 'translateX(-100%)',
  },
};
