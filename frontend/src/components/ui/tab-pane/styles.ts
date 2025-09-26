import { cva } from 'class-variance-authority';

export const tabButtonCva = cva('p-2 cursor-pointer border-2 border-solid border-transparent hover:text-secondary', {
  variants: {
    selected: {
      true: 'text-primary',
      false: '',
    },
    orientation: {
      vertical: '-mr-[1px]',
      horizontal: '-mb-[1px]',
    },
  },
  compoundVariants: [
    {
      selected: true,
      orientation: 'vertical',
      class: 'border-r-primary',
    },
    {
      selected: true,
      orientation: 'horizontal',
      class: 'border-b-primary',
    },
  ],
  defaultVariants: {
    selected: false,
    orientation: 'horizontal',
  },
});
