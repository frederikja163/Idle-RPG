import type { FC } from 'react';
import { fnNameFor } from '@vitest/expect';

export const setDisplayName = <T>(functionComponent: FC | FC<T>) => {
  functionComponent.displayName = fnNameFor(functionComponent);
};
