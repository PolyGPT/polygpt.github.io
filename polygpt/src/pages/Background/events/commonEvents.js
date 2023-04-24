import Browser from 'webextension-polyfill';
import * as storageKeys from '../../../codes/Storage';
import { getTranslationCacheKey, LocalStorageAPI, SyncStorageAPI } from '../../../utils/storage';
import * as eventType from '../../../codes/EventType';
import { promptManager } from '../../../codes/Prompt';
import { POLY_SITE, TEST_SITE } from '../../../codes/Common';

export const getConfig = async (request, sender, sendResponse, port) => {
  const config = await SyncStorageAPI.get(storageKeys.CONFIG);
  // await sendMessage(sender?.tab?.id, request.type, config, port);
  return config;
};

export const setConfig = async (request, sender, sendResponse, port) => {
  let data = request.payload;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error('config data is not valid', data, e);
      throw e;
    }
  }
  await SyncStorageAPI.set(storageKeys.CONFIG, data);

  return data;
};

export const getLocalCache = async (request, sender, sendResponse, port) => {
  const result = await LocalStorageAPI.get(request.payload.key);

  return result;
};

export const setLocalCache = async (request, sender, sendResponse, port) => {
  const result = await LocalStorageAPI.set(request.payload.key, request.payload.value);

  return result;
};

export const getPrompt = async (request, sender, sendResponse, port) => {
  const result = await promptManager.getPrompt(request.payload?.key);

  return result;
};

export const setPrompt = async (request, sender, sendResponse, port) => {
  const result = await promptManager.setPrompt(request.payload.prompt);

  return result;
};

export const getTranslateCache = async ({ trans_type, message_id, paragraph_seq }) => {
  const cacheKey = getTranslationCacheKey(trans_type, message_id, paragraph_seq);
  const cachedValue = await LocalStorageAPI.get(cacheKey);
  if (cachedValue) {
    return cachedValue;
  }
  return null;
};

export const setTranslateCache = async ({ trans_type, message_id, paragraph_seq, other_lang, english, other, role, source_lang, target_lang }) => {
  const cacheKey = getTranslationCacheKey(trans_type, message_id, paragraph_seq);
  const cacheD = {
    english: english,
    other: other,
    message_id,
    role,
    paragraph_seq: paragraph_seq,
    other_lang: other_lang,
    trans_type: trans_type,
    source_lang: source_lang,
    target_lang: target_lang,
  };
  await LocalStorageAPI.set(cacheKey, cacheD);
  return cacheD;
};

const requestGetTranslateCache = async (request, sender, sendResponse, port) => {
  const { trans_type, message_id, paragraph_seq } = request.payload;

  return await getTranslateCache({ trans_type, message_id, paragraph_seq });
};

const requestSetTranslateCache = async (request, sender, sendResponse, port) => {
  const { trans_type, message_id, paragraph_seq, other_lang, english, other, role, source_lang, target_lang } = request.payload;

  return setTranslateCache(trans_type, message_id, paragraph_seq, other_lang, english, other, role, source_lang, target_lang);
};

const requestLoginChatGPT = async (request, sender, sendResponse, port) => {
  const tabs = await Browser.tabs.query({ url: `${POLY_SITE}/*` });

  for (const tab of tabs) {
    try {
      await Browser.tabs.sendMessage(tab.id, {
        type: eventType.EVENT_LOGIN_CHAT_GPT,
      });
    } catch {}
  }

  return {
    success: true,
  };
};

const requestSearchExtension = async (request, sender, sendResponse, port) => {
  const { name } = request.payload;
  const extensions = await Browser.management.getAll();
  console.log('extensions', extensions);

  return extensions.filter((item) => item.name.indexOf(name) > -1);
};

export const CommonEventExecutor = {
  [eventType.EVENT_GET_CONFIG]: getConfig,
  [eventType.EVENT_SET_CONFIG]: setConfig,
  [eventType.EVENT_GET_LOCAL_CACHE]: getLocalCache,
  [eventType.EVENT_SET_LOCAL_CACHE]: setLocalCache,
  [eventType.EVENT_GET_PROMPT]: getPrompt,
  [eventType.EVENT_SET_PROMPT]: setPrompt,
  [eventType.EVENT_GET_TRANSLATE_CACHE]: requestGetTranslateCache,
  [eventType.EVENT_SET_TRANSLATE_CACHE]: requestSetTranslateCache,
  [eventType.EVENT_LOGIN_CHAT_GPT]: requestLoginChatGPT,
  [eventType.EVENT_SEARCH_EXTENSION]: requestSearchExtension,
};
