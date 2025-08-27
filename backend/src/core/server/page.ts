import type { InjectionToken } from 'tsyringe';

export interface Page<T extends string> {
  get route(): T;
  get handler(): Bun.RouterTypes.RouteValue<T>;
}
export const PageToken: InjectionToken<Page<string>> = Symbol('Page');
