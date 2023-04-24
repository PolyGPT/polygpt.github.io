import Browser from 'webextension-polyfill';
import { EXPIRE_SEC } from '../codes/Storage';

export const getTranslationCacheKey = (transType, messageId, paragraphSeq) => {
  return `${transType}::${messageId}::${paragraphSeq}`;
};

export const SyncStorageAPI = (function () {
  const get = async (key) => {
    const result = await Browser.storage.sync.get([key]);
    return result[key];
  };
  const set = async (key, v) => {
    await Browser.storage.sync.set({ [key]: v });
  };

  return {
    async get(key) {
      return await get(key);
    },
    async set(k, v) {
      return await set(k, v);
    },
  };
})();

export const LocalStorageAPI = (function () {
  const get = async (key) => {
    const result = await Browser.storage.local.get([key]);
    if (!result[key]) {
      return null;
    }
    await Browser.storage.local.set({ [key]: { data: result[key]['data'], timestamp: Date.now() } });
    return result[key]['data'];
  };
  const set = async (key, v) => {
    await Browser.storage.local.set({ [key]: { data: v, timestamp: Date.now() } });
  };

  const remove = async (key) => {
    await Browser.storage.local.remove(key);
  };

  const expire = async () => {
    const allItems = await Browser.storage.local.get(null);
    const now = Date.now();
    const expiredKeys = [];
    for (const [k, v] of Object.entries(allItems)) {
      if (now - v.timestamp >= EXPIRE_SEC) {
        await remove(k);
        expiredKeys.push(k);
      }
    }
    return expiredKeys;
  };

  return {
    async get(key) {
      return await get(key);
    },
    async set(key, v) {
      return await set(key, v);
    },
    async remove(key) {
      return await remove(key);
    },
    async expire() {
      return await expire();
    },
  };
})();
