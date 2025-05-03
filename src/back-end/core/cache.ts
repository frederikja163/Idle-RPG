export interface ICache {
  cleanup(): void | Promise<void>;
}
