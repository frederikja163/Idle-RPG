export const arrayToMap = <T extends object, K extends keyof T>(array: T[], key: K): Map<T[K], T> => {
  const map = new Map<T[K], T>();

  for (const item of array) {
    map.set(item[key], item);
  }

  return map;
};

export const mapEntriesToArray = <TKey, TValue>(map: Map<TKey, TValue> | undefined) => {
  return [...(map?.entries() ?? [])];
};

export const mapKeysToArray = <TKey, TValue>(map: Map<TKey, TValue> | undefined) => {
  return [...(map?.keys() ?? [])];
};

export const mapValuesToArray = <TKey, TValue>(map: Map<TKey, TValue> | undefined) => {
  return [...(map?.values() ?? [])];
};
