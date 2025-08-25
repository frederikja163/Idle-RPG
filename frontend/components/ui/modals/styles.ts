import { cva } from 'class-variance-authority';

export const overlayCva = cva('fixed bg-black opacity-40 inset-0');
export const contentCva = cva('fixed top-1/2 left-1/2');
export const cardCva = cva('flex flex-col p-6 gap-6 -translate-1/2');
export const titleCva = cva('text-xl');
