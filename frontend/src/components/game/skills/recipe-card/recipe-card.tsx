import React, { type CSSProperties, type FC, useCallback, useEffect, useMemo } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import { type CraftingRecipeDef } from '@/shared/definition/definition-crafting';
import { Image } from '@/frontend/components/ui/image';
import { Typography } from '@/frontend/components/ui/typography';
import { Card } from '@/frontend/components/ui/card';
import { Divider } from '@/frontend/components/ui/layout/divider';
import { CirclePlay, Clock, Lock } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { activeActivityAtom, profileItemsAtom, profileSkillsAtom } from '@/frontend/store/atoms';
import { motion, useAnimation } from 'framer-motion';
import { useSocket } from '@/frontend/providers/socket-provider';
import { getKey, getMsUntilActionDone } from '@/frontend/lib/utils';
import { Row } from '@/frontend/components/ui/layout/row';
import { nameOf } from '@/frontend/lib/function-utils';
import { RecipeCardSlot } from '@/frontend/components/game/skills/recipe-card/recipe-card-slot';
import { recipeCardCva } from '@/frontend/components/game/skills/recipe-card/styles';
import { BasicTooltip } from '@/frontend/components/ui/basic-tooltip';
import { RecipeLockedTooltip } from '@/frontend/components/game/skills/recipe-card/recipe-locked-tooltip';
import { RecipeItemsTooltip } from '@/frontend/components/game/skills/recipe-card/recipe-items-tooltip';
import { InventoryItem } from '@/frontend/components/game/inventory/inventory-item';
import { BasicHoverCard } from '@/frontend/components/ui/basic-hover-card';

interface Props {
  recipeDef: CraftingRecipeDef;
  className?: string;
}

export const RecipeCard: FC<Props> = React.memo((props) => {
  const { recipeDef, className } = props;

  const socket = useSocket();
  const animationControls = useAnimation();
  const activeActivity = useAtomValue(activeActivityAtom);
  const profileSkills = useAtomValue(profileSkillsAtom);
  const profileItems = useAtomValue(profileItemsAtom);

  const isActive = useMemo(
    () => activeActivity?.type !== 'none' && activeActivity?.recipeId === recipeDef.id,
    [activeActivity, recipeDef.id],
  );

  const isUnlocked = useMemo(
    () =>
      recipeDef.skillRequirements.every(
        (requirement) => (profileSkills.get(requirement.skillId)?.level ?? 0) >= requirement.level,
      ),
    [profileSkills, recipeDef.skillRequirements],
  );

  const canAfford = useMemo(
    () => recipeDef.cost.every((itemAmount) => profileItems.get(itemAmount.itemId)?.count ?? 0 >= itemAmount.amount),
    [profileItems, recipeDef.cost],
  );

  const costAmountsSorted = useMemo(
    () =>
      recipeDef.cost.slice().sort((itemA, itemB) => {
        const profileItemAmountA = profileItems.get(itemA.itemId)?.count ?? 0;
        const missingAmountA = itemA.amount - profileItemAmountA;

        const profileItemAmountB = profileItems.get(itemB.itemId)?.count ?? 0;
        const missingAmountB = itemB.amount - profileItemAmountB;

        return missingAmountB - missingAmountA;
      }),
    [profileItems, recipeDef.cost],
  );

  const mainSkill = useMemo(() => recipeDef.skillRequirements.at(0), [recipeDef.skillRequirements]);
  const mainResult = useMemo(() => recipeDef.result.at(0), [recipeDef.result]);
  const mainCost = useMemo(() => costAmountsSorted.at(0), [costAmountsSorted]);

  const canAffordMainCost = useMemo(
    () => (mainCost ? (profileItems.get(mainCost.itemId)?.count ?? 0) >= mainCost.amount : false),
    [mainCost, profileItems],
  );

  const style = useMemo(
    () =>
      `${recipeCardCva({
        isUnlocked,
        canAfford,
      })} ${className}`,
    [canAfford, className, isUnlocked],
  );

  const handleClick = useCallback(() => {
    if (isActive) {
      socket?.send('Profile/ActivityReplace', { type: 'none' });
      return;
    }

    if (!isUnlocked || !canAfford) return;

    socket?.send('Profile/ActivityReplace', { type: 'crafting', recipeId: recipeDef.id });
  }, [canAfford, isUnlocked, isActive, recipeDef.id, socket]);

  useEffect(() => {
    if (!isActive || !activeActivity || activeActivity.type === 'none') {
      animationControls.stop();
      animationControls.set({ x: '-100%' });
      return;
    }

    const msUntilActionDone = getMsUntilActionDone(activeActivity.recipeId, activeActivity.start);
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
  }, [activeActivity, activeActivity?.type, animationControls, isActive, recipeDef.time]);

  return (
    <BasicTooltip
      tooltipContent={<RecipeLockedTooltip skillRequirements={recipeDef.skillRequirements} />}
      isDisabled={isUnlocked}>
      <Card className={style} onClick={handleClick}>
        <motion.div
          animate={animationControls}
          className="absolute h-full w-full -m-2 bg-primary"
          style={styles.animatedBackground}
        />
        <Column className="relative">
          <Column className="relative">
            {!isUnlocked && (
              <Lock className="absolute w-2/3 h-auto z-10 justify-self-center place-self-center top-1/2 -translate-y-1/2 opacity-40" />
            )}
            {isActive && <CirclePlay size={30} className="absolute right-0" />}
            {mainResult && (
              <Image
                src={`${import.meta.env.VITE_BASE_URL}/assets/items/${mainResult.itemId}.svg`}
                alt={mainResult.itemId}
                className="p-6 aspect-square"
              />
            )}
          </Column>
          {/* The min-height below might not be the ideal way to make equal heights. Should maybe use grids, but it's a big refactor */}
          <Column className="min-h-20">
            {recipeDef.result.length > 1 && (
              <Row className="justify-center">
                {recipeDef.result.map((item) => (
                  <Column key={getKey()} className="p-1 w-10 items-center">
                    <Image
                      src={`${import.meta.env.VITE_BASE_URL}/assets/items/${item.itemId}.svg`}
                      alt={item.itemId}
                      className="aspect-square"
                    />
                    <Typography className="text-sm">{item.amount}</Typography>
                  </Column>
                ))}
              </Row>
            )}
            <Typography>{recipeDef.display}</Typography>
          </Column>
          <Divider className="my-2" />
          <Row className="items-center">
            <RecipeCardSlot
              bottom={`${Math.round(recipeDef.time / 1000)}s`}
              top={<Clock className="stroke-muted-foreground" />}
            />
            <Divider orientation="vertical" />
            {mainSkill && (
              <RecipeCardSlot
                bottom={`${mainSkill?.xp} XP`}
                top={
                  <Row className="max-h-8 aspect-square">
                    <Image
                      src={`${import.meta.env.VITE_BASE_URL}/assets/skills/${mainSkill.skillId}.svg`}
                      alt={mainSkill.skillId}
                      className="p-1"
                    />
                  </Row>
                }
              />
            )}
            {mainCost && (
              <>
                <Divider orientation="vertical" />
                <Row className="pl-2">
                  <BasicHoverCard
                    hoverContent={<RecipeItemsTooltip title="Item costs" itemAmounts={costAmountsSorted} />}
                    isDisabled={costAmountsSorted.length < 2}>
                    {/*Wrapped in row due to nested tooltips/hover cards*/}
                    <Row>
                      <InventoryItem
                        item={{ id: mainCost.itemId, count: mainCost.amount }}
                        background={canAffordMainCost ? 'standard' : 'error'}
                        disableTooltip={costAmountsSorted.length > 1}
                      />
                    </Row>
                  </BasicHoverCard>
                </Row>
              </>
            )}
          </Row>
        </Column>
      </Card>
    </BasicTooltip>
  );
});

const styles: { [key: string]: CSSProperties } = {
  animatedBackground: {
    transform: 'translateX(-100%)',
  },
};

RecipeCard.displayName = nameOf({ RecipeCard });
