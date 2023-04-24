import Browser from 'webextension-polyfill';
import { ROLE_USER_TYPE } from '../../codes/RoleType';
import { COMPLETE_STATUS, UNKNOWN_STATUS } from '../../codes/Status';
import { SyncStorageAPI } from '../../utils/storage';
import * as storageKeys from '../../codes/Storage';
import * as transTypes from '../../codes/TransType';
import * as eventType from '../../codes/EventType';
import { supportConversationManager } from './supportConversation';
import * as userInputLengthTypes from '../../codes/UserInputLengthTypes';
import { getLoginInfo } from './core';
import { promptManager } from '../../codes/Prompt';
import { hasLanguageCode } from '../../codes/Languages';

export const getChromeTab = async (tabId) => {
  try {
    const tabInfo = await Browser.tabs.get(tabId);
    return tabInfo;
  } catch (e) {
    return null;
  }
};

export const getChromeTabStatus = async (tabId) => {
  try {
    const tabInfo = await getChromeTab(tabId);
    if (tabInfo && tabInfo.status) {
      return tabInfo.status;
    } else {
      return UNKNOWN_STATUS;
    }
  } catch (e) {
    return UNKNOWN_STATUS;
  }
};

export const sendMessage = async (tabId, type, payload, port) => {
  if (port) {
    port.postMessage({ type, payload });
  } else {
    const status = await getChromeTabStatus(tabId);
    if (status === COMPLETE_STATUS) {
      Browser.tabs.sendMessage(tabId, { type, payload });
    }
  }
};

export const getSyncConfig = async () => {
  if (process.env.NODE_ENV === 'test') {
    return {};
  }
  return await SyncStorageAPI.get(storageKeys.CONFIG);
};

const detectLangChromei18n = async (text) => {
  const result = await Browser.i18n.detectLanguage(text);
  const languages = result.languages;
  return languages;
};

export const calcPosterior = (i18nResult, role, config) => {
  const normalize = (arr) => {
    let sum = 0;
    for (const v of arr) {
      sum += v.prior;
    }
    return arr.map((v) => {
      return {
        ...v,
        prior: v.prior / sum,
      };
    });
  };
  let userLang = config.user_language;
  let result = [];

  const userLangResult = i18nResult.filter((v) => v.language === userLang)[0];
  const enResult = i18nResult.filter((v) => v.language === transTypes.DEFAULT_CHATGPT_LANGUAGE)[0];
  const another = i18nResult.filter((v) => v.language !== userLang && v.language !== transTypes.DEFAULT_CHATGPT_LANGUAGE);
  if (userLangResult) {
    result.push({
      ...userLangResult,
      prior: (userLangResult.percentage / 100) * (role === ROLE_USER_TYPE ? 0.4 : 0.35),
    });
  }
  if (enResult) {
    result.push({
      ...enResult,
      prior: (enResult.percentage / 100) * (role === ROLE_USER_TYPE ? 0.35 : 0.4),
    });
  }

  if (another && another.length > 0) {
    another.forEach((v) => {
      result.push({
        ...v,
        prior: ((v.percentage / 100) * 0.25) / another.length,
      });
    });
  }

  const normalized = normalize(result);

  return normalized;
};

export const detectLangChatGPT = async (text, model) => {
  const { accessToken } = await getLoginInfo();
  const { text: detectedResult } = await supportConversationManager.detectLang({ accessToken, text, model });
  return detectedResult;
};

export const detectLanguage = async ({ input_text, role, model }) => {
  const fn = async () => {
    if (process.env.NODE_ENV === 'test') {
      return 'en';
    }
    const prompt = await promptManager.getPrompt();
    const config = await getSyncConfig();

    let userLang = config.user_language;

    const i18nReuslt = await detectLangChromei18n(input_text);
    console.info('detectLanguage: chrome i18n Result - ', i18nReuslt);
    const posterior = calcPosterior(i18nReuslt, role, config);
    console.info('detectLanguage: posterior - ', posterior);

    let isDetected = false;
    posterior.forEach((v) => {
      if ([transTypes.DEFAULT_CHATGPT_LANGUAGE, userLang].includes(v.language)) {
        isDetected = true;
      }
    });
    if (isDetected) {
      const top1Posterior = posterior.sort((a, b) => b.prior - a.prior)[0];
      if (top1Posterior) {
        return top1Posterior.language;
      }
    }

    if (prompt.LANGUAGE_DETECTION_BY_CHATGPT) {
      let result = await detectLangChatGPT(input_text, model);
      console.info('detectLanguage: chatGPT result - ', result);
      const index = result.lastIndexOf('|');
      if (index !== -1) {
        if (result.lastIndexOf('"') > index) {
          result = result.substring(result.lastIndexOf('"', index) + 1, index).trim();
          if (hasLanguageCode(result)) {
            return result;
          }
          return transTypes.DEFAULT_CHATGPT_LANGUAGE;
        }
        if (result.length > 4) {
          const startIndex = result.replace(/\n/, ' ').lastIndexOf(' ', index - 2);
          if (startIndex !== -1) {
            result = result.substring(startIndex + 1, index).trim();
            if (hasLanguageCode(result)) {
              return result;
            }
            return transTypes.DEFAULT_CHATGPT_LANGUAGE;
          }
        }
        result = result.substring(0, index).trim();
        if (hasLanguageCode(result)) {
          return result;
        }
        return transTypes.DEFAULT_CHATGPT_LANGUAGE;
      }
    }
    const result = role === ROLE_USER_TYPE ? config.user_language : transTypes.DEFAULT_CHATGPT_LANGUAGE;
    console.info('detectLanguage: role result - ', result);
    return result;
  };
  console.group('detectLanguage');
  const result = await fn();
  console.groupEnd();
  return result;
};

export const getUserInputLengthType = (str) => {
  const trimmedTokens = str.trim();
  const tokens = trimmedTokens.split(' ');
  const wordCount = tokens.length;
  if (wordCount <= 6) {
    return userInputLengthTypes.SHORT;
  } else if (wordCount <= 34) {
    return userInputLengthTypes.LONG;
  } else {
    return userInputLengthTypes.VERY_LONG;
  }
};

export const errorCallBack = (type, tabId, port) => (e) => {
  console.error(`ERROR - ${type} -`, e);
  console.error(`ERROR - ${type} -`, e.message, e.status, e.value);
  sendMessage(tabId, eventType.EVENT_RAISE_EXCEPTION, { message: e.message, stack: e.stack }, port);
};
