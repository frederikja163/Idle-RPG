import type { InjectionToken } from 'tsyringe';

export interface CleanupEventListener {
  cleanup(): void | Promise<void>;
}
export const CleanupEventToken: InjectionToken<CleanupEventListener> = Symbol('CleanupEvent');
