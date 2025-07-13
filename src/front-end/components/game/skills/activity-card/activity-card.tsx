import React, { type CSSProperties, type FC, type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Column } from '@/front-end/components/ui/layout/column.tsx';
import {
  type GatheringActivityDef,
  NoActivity,
  type ProcessingActivityDef,
} from '@/shared/definition/definition-activities.ts';
import { Image } from '@/front-end/components/ui/image.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { Divider } from '@/front-end/components/ui/layout/divider.tsx';
import { CirclePlay } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { activeActivityAtom } from '@/front-end/store/atoms.tsx';
import { motion, useAnimation } from 'framer-motion';
import { useSocket } from '@/front-end/providers/socket-provider.tsx';
import { getMsUntilActionDone } from '@/front-end/lib/utils.ts';
import { useWindowSize } from '@/front-end/hooks/use-window-size.tsx';

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
