import React, { type FC, useMemo } from 'react';
import type { Skill } from '@/shared/definition/schema/types/types-skills';
import { CraftingRecipeDef, type CraftingRecipeId } from '@/shared/definition/definition-crafting';
import { nameOf } from '@/frontend/lib/function-utils';
import { RecipeCard } from '@/frontend/components/game/skills/recipe-card/recipe-card';
import { Grid } from '@/frontend/components/ui/layout/grid';

interface Props {
  skill: Partial<Skill>;
}

export const RecipesGrid: FC<Props> = React.memo((props) => {
  const { skill } = props;

  const recipeBoxes = useMemo(
    () =>
      skill.id &&
      CraftingRecipeDef.getAllRecipes()
        .filter(
          ([_, craftingRecipeDef]: [CraftingRecipeId, CraftingRecipeDef]) =>
            craftingRecipeDef.getSkillRequirements().find(() => true)?.skill.id === skill.id,
        )
        .map(([id, craftingRecipeDef]: [CraftingRecipeId, CraftingRecipeDef]) => (
          <RecipeCard key={id} recipeDef={craftingRecipeDef} />
        ))
        .toArray(),
    [skill.id],
  );

  return <Grid className="w-full h-min gap-4 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">{recipeBoxes}</Grid>;
});

RecipesGrid.displayName = nameOf({ RecipesGrid });
