import React, { type CSSProperties, type FC, type ReactNode, useCallback, useEffect } from 'react';
import { Column } from '@/front-end/components/layout/column.tsx';
import { type GatheringActivityDef, type ProcessingActivityDef } from '@/shared/definition/definition-activities.ts';
import { Image } from '@/front-end/components/ui/image.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { Divider } from '@/front-end/components/ui/divider.tsx';
import { CirclePlay } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { activeActivityAtom, activityProgressPercentAtom } from '@/front-end/state/atoms.tsx';
import { motion, useAnimation } from 'framer-motion';
import { useSocket } from '@/front-end/state/socket-provider.tsx';

interface Props {
  activityDef: GatheringActivityDef | ProcessingActivityDef;
  className?: string;
  handleStart: () => void;
  children: ReactNode;
}

export const ActivityCard: FC<Props> = React.memo(function ActivityCard(props) {
  const { activityDef, className, handleStart, children } = props;

  const socket = useSocket();
  const animationControls = useAnimation();
  const activeActivity = useAtomValue(activeActivityAtom);
  const activityProgressPercent = useAtomValue(activityProgressPercentAtom);

  const isActive = activeActivity?.activityId === activityDef.id;

  const handleClick = useCallback(() => {
    if (isActive) {
      socket?.send('Activity/StopActivity', { activityId: activityDef.id });
      return;
    }

    handleStart();
  }, [activityDef.id, handleStart, isActive, socket]);

  useEffect(() => {
    if (!isActive) {
      animationControls.stop();
      animationControls.set({ x: '-100%' });
      return;
    }

    const initialProgressPercent = activityProgressPercent ?? 0;
    const duration = activityDef.time / 1000;
    const firstDuration = duration * (1 - initialProgressPercent / 100);
    const startX = `${-100 + Math.round(initialProgressPercent)}%`;

    animationControls
      .start({
        x: [startX, '0%'],
        transition: {
          duration: firstDuration,
          ease: 'linear',
        },
      })
      .then(() =>
        animationControls.start({
          x: ['-100%', '0%'],
          transition: {
            duration,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          },
        }),
      );
  });

  return (
    <Card className={`p-2 w-48 bg-background relative overflow-hidden ${className}`} onClick={handleClick}>
      <motion.div
        animate={animationControls}
        className="absolute h-full w-full -m-2 bg-primary"
        style={styles.animatedBackground}
      />
      <Column className="gap-2 relative">
        {isActive && <CirclePlay size={30} className="absolute right-0" />}
        <Image
          src={`/assets/items/${activityDef.result.itemId}.svg`}
          alt={activityDef.result.itemId}
          className="p-6 aspect-square"
        />
        <Typography className="text-lg">{activityDef.display}</Typography>
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
