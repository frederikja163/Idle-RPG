import React, { type FC, useMemo } from 'react';
import { Row } from '@/front-end/components/ui/layout/row.tsx';
import type { Skill } from '@/shared/definition/schema/types/types-skills.ts';
import {
  type CraftingRecipeDef,
  type CraftingRecipeId,
  craftingRecipes,
} from '@/shared/definition/definition-crafting';
import { nameOf } from '@/front-end/lib/function-utils.ts';
import { RecipeCard } from '@/front-end/components/game/skills/activity-card/recipe-card.tsx';

interface Props {
  skill: Partial<Skill>;
}

export const RecipesGrid: FC<Props> = React.memo((props) => {
  const { skill } = props;

  const recipeBoxes = useMemo(
    () =>
      skill.id &&
      craftingRecipes
        .entries()
        .filter(
          ([_, craftingRecipeDef]: [CraftingRecipeId, CraftingRecipeDef]) =>
            craftingRecipeDef.skillRequirements.at(0)?.skillId === skill.id,
        )
        .map(([id, craftingRecipeDef]: [CraftingRecipeId, CraftingRecipeDef]) => (
          <RecipeCard key={id} recipeDef={craftingRecipeDef} />
        )),
    [skill.id],
  );

  return <Row className="gap-4 items-start flex-wrap">{recipeBoxes}</Row>;
});

RecipesGrid.displayName = nameOf({ RecipesGrid });
