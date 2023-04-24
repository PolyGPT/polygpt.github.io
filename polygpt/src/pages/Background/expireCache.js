import ExpiryMap from 'expiry-map';

class Cache {
  constructor(expireTime = 10 * 1000) {
    this._cache = new ExpiryMap(expireTime);
  }

  get(k) {
    return this._cache.get(k);
  }

  set(k, v) {
    return this._cache.set(k, v);
  }
}

export const cache = new Cache();
