import {
  container,
  injectable,
  singleton,
  type InjectionToken,
} from "tsyringe";
import type { constructor } from "tsyringe/dist/typings/types";

export function injectableSingleton<T>(
  ...tokens: InjectionToken<unknown>[]
): (target: constructor<T>) => void {
  return function (target: constructor<T>): void {
    injectable()(target);
    singleton()(target);

    const instance = container.resolve(target);
    for (const token of tokens) {
      container.register(token, { useValue: instance });
    }
  };
}

export function resolveAll<T>(token: InjectionToken<T>) {
  return container.isRegistered(token) ? container.resolveAll(token) : [];
}
