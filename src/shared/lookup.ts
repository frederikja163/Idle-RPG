export class Lookup<TKey, TValue> {
  private readonly _map = new Map<TKey, Set<TValue>>();

  public add(key: TKey, value: TValue) {
    let set = this._map.get(key);
    if (!set) {
      set = new Set<TValue>();
      this._map.set(key, set);
    }
    set.add(value);
  }

  public remove(key: TKey, value: TValue) {
    const set = this._map.get(key);
    if (set) {
      set.delete(value);
      // For now we allow empty sets.
    }
  }

  public has(key: TKey, value: TValue) {
    const set = this._map.get(key);
    return set && set.has(value);
  }

  public getValues(key: TKey) {
    return this._map.get(key);
  }
}
