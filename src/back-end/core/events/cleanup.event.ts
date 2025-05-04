import { container, injectable } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';

export interface CleanupEventListener {
  cleanup(): void | Promise<void>;
}
export class CleanupEventToken {}
