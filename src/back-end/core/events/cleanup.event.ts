export interface CleanupEventListener {
  cleanup(): void | Promise<void>;
}
export class CleanupEventToken {}
