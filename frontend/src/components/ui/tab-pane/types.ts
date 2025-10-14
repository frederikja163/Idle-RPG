import type { ReactNode } from 'react';

export interface Tab {
  content: ReactNode;
  label?: string;
  buttonContent?: ReactNode;
}
