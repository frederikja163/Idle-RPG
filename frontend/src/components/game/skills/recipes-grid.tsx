import React, { type FC, useMemo } from 'react';
import { Row } from '@/frontend/components/ui/layout/row';
import type { Skill } from '@/shared/definition/schema/types/types-skills';
import {
  type CraftingRecipeDef,
  type CraftingRecipeId,
  craftingRecipes,
} from '@/shared/definition/definition-crafting';
import { nameOf } from '@/frontend/lib/function-utils';
import { RecipeCard } from '@/frontend/components/game/skills/recipe-card/recipe-card';
import { mapEntriesToArray } from '@/frontend/lib/array-utils';

interface Props {
  skill: Partial<Skill>;
}

export const RecipesGrid: FC<Props> = React.memo((props) => {
  const { skill } = props;

  const recipeBoxes = useMemo(
    () =>
      skill.id &&
      mapEntriesToArray(craftingRecipes)
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
