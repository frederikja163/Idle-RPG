import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FormEvent } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormData<T>(formEvent: FormEvent<HTMLFormElement>) {
  const formData = new FormData(formEvent.currentTarget);
  return Object.fromEntries(formData.entries()) as unknown as T;
}
