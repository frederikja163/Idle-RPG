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
import { getMsUntilActionDone } from '@/frontend/lib/utils';
import { Row } from '@/frontend/components/ui/layout/row';
import { nameOf } from '@/frontend/lib/function-utils';
import { RecipeCardSlot } from '@/frontend/components/game/skills/recipe-card/recipe-card-slot';
import { recipeCardCva } from '@/frontend/components/game/skills/recipe-card/styles';
import { BasicTooltip } from '@/frontend/components/ui/basic-tooltip';
import { RecipeLockedTooltip } from '@/frontend/components/game/skills/recipe-card/recipe-locked-tooltip';
import { RecipeItemsTooltip } from '@/frontend/components/game/skills/recipe-card/recipe-items-tooltip';
import { InventoryItem } from '@/frontend/components/game/inventory/inventory-item';
import { BasicHoverCard } from '@/frontend/components/ui/basic-hover-card';
import { assetsBasePath } from '@/frontend/constants/asset-consts';

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
      recipeDef
        .getSkillRequirements()
        .every((requirement) => (profileSkills.get(requirement.skill.id)?.level ?? 0) >= requirement.level),
    [profileSkills, recipeDef],
  );

  const canAfford = useMemo(
    () =>
      recipeDef.getCosts().every((itemAmount) => profileItems.get(itemAmount.item.id)?.count ?? 0 >= itemAmount.amount),
    [profileItems, recipeDef],
  );

  const costAmountsSorted = useMemo(
    () =>
      recipeDef
        .getCosts()
        .toArray()
        .sort((itemA, itemB) => {
          const profileItemAmountA = profileItems.get(itemA.item.id)?.count ?? 0;
          const missingAmountA = itemA.amount - profileItemAmountA;

          const profileItemAmountB = profileItems.get(itemB.item.id)?.count ?? 0;
          const missingAmountB = itemB.amount - profileItemAmountB;

          return missingAmountB - missingAmountA;
        }),
    [profileItems, recipeDef],
  );

  const mainSkill = useMemo(() => recipeDef.getSkillRequirements().find((_) => true), [recipeDef]);
  const mainResult = useMemo(() => recipeDef.getResults().find((_) => true), [recipeDef]);
  const mainCost = useMemo(() => costAmountsSorted.at(0), [costAmountsSorted]);

  const canAffordMainCost = useMemo(
    () => (mainCost ? (profileItems.get(mainCost.item.id)?.count ?? 0) >= mainCost.amount : false),
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
      tooltipContent={<RecipeLockedTooltip skillRequirements={recipeDef.getSkillRequirements()} />}
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
                src={`${assetsBasePath}items/${mainResult.itemId}.svg`}
                alt={mainResult.item.id}
                className="p-6 aspect-square"
              />
            )}
          </Column>
          {/* The min-height below might not be the ideal way to make equal heights. Should maybe use grids, but it's a big refactor */}
          <Column className="min-h-20">
            {recipeDef.getSkillRequirements().some((_) => true) && (
              <Row className="justify-center">
                {recipeDef
                  .getResults()
                  .map((item) => (
                    <Column key={item.item.id} className="p-1 w-10 items-center">
                      <Image
                      src={`${assetsBasePath}items/${item.itemId}.svg`}
                        alt={item.item.id}
                        className="aspect-square"
                      />
                      <Typography className="text-sm">{item.amount}</Typography>
                    </Column>
                  ))
                  .toArray()}
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
                      src={`${assetsBasePath}skills/${mainSkill.skillId}.svg`}
                      alt={mainSkill.skill.id}
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
                        item={{ id: mainCost.item.id, count: mainCost.amount }}
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
