import type { Query, QueryMany, Update, UpdateMany } from '@/shared/socket/socket-types';

export function transformQuery<T extends { [key: string]: unknown }>(value: T, query: Query<T>): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, include] of Object.entries(query)) {
    if (include) {
      result[key] = value[key];
    }
  }
  return result as Partial<T>;
}

export function transformQueryMany<T extends { id: string } & { [key: string]: unknown }>(
  values: T[],
  query: QueryMany<T>,
): Partial<T>[] {
  const results: Partial<T>[] = [];
  for (const value of values) {
    const queryId = query.id;
    if (queryId instanceof Array) {
      if (queryId.includes(value.id)) {
        const result = transformQuery(value, query);
        result.id = value.id;
        results.push(result);
      }
    } else {
      const result = transformQuery(value, query);
      results.push(result);
    }
  }
  return results;
}

export function updateValue<T extends { id: string } & { [key: string]: unknown }>(
  object: T,
  update: Update<T>,
): Partial<T> {
  const value: Partial<T> = {};
  for (const key in update) {
    if (update[key]) {
      object[key] = update[key];
      value[key] = update[key];
      value.id = object.id;
    }
  }
  return value;
}
export function updateValueMany<T extends { id: string } & { [key: string]: unknown }>(
  objects: T[],
  update: UpdateMany<T>,
): Partial<T>[] {
  const updated = [];
  for (const object of objects) {
    const updateId = update.id;
    if (!(updateId instanceof Array) || updateId.includes(object.id)) {
      const id = updateValue(object, update as Update<T>);
      updated.push(id);
    }
  }
  return updated;
}
