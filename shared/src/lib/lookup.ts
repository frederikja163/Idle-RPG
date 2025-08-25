export class Lookup<TKey, TValue> {
  private readonly _map = new Map<TKey, Set<TValue>>();

  public get size() {
    return this._map.size;
  }

  public *entries() {
    for (const [k, vs] of this._map) {
      yield [k, vs.entries().map(([s, _]) => s)];
    }
  }

  public *values() {
    for (const [k, vs] of this._map) {
      for (const v of vs) {
        yield [k, v];
      }
    }
  }

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
      if (set.size === 0) {
        this._map.delete(key);
      }
    }
  }

  public removeKey(key: TKey) {
    this._map.delete(key);
  }

  public has(key: TKey, value: TValue) {
    const set = this._map.get(key);
    return set && set.has(value);
  }

  public hasKey(key: TKey) {
    return this._map.has(key);
  }

  public get(key: TKey) {
    return this._map.get(key);
  }

  public clear() {
    this._map.clear();
  }
}
