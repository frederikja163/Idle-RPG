import { cva } from 'class-variance-authority';

export const recipeCardCva = cva('p-2 bg-background relative overflow-hidden grow min-w-44 max-w-44 opacity-50', {
  variants: {
    isUnlocked: {
      true: '',
      false: '',
    },
    canAfford: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      isUnlocked: true,
      canAfford: true,
      class: 'cursor-pointer opacity-100',
    },
  ],
});
