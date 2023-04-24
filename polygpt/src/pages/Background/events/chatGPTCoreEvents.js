import { sendMessage, getSyncConfig, getUserInputLengthType, detectLanguage, errorCallBack } from '../utils';
import { postConversation } from '../core';
import * as eventType from '../../../codes/EventType';
import { chatGPTQueue } from '../chatGPTQueue';
import * as commonConsts from '../../../codes/Queue';
import * as queueConsts from '../../../codes/Queue';
import * as transType from '../../../codes/TransType';
import * as userInputLengthTypes from '../../../codes/UserInputLengthTypes';
import { translator } from '../../Background/translator';
import { promptManager } from '../../../codes/Prompt';
import { DEFAULT_MODEL } from '../../../codes/ChatGPT';

let abortController = new AbortController();
let abortSignal = abortController.signal;

export const stopConversation = async (request, sender, sendResponse, port) => {
  if (abortSignal.aborted) {
    abortController = new AbortController();
    abortSignal = abortController.signal;
  }
  abortController.abort();
  if (abortSignal.aborted) {
    abortController = new AbortController();
    abortSignal = abortController.signal;
  } else {
    throw new Error('Abort Failed');
  }

  return {};
};

export const requestDetectLanguage = async (request, sender, sendResponse, port) => {
  const chatData = request.payload;

  return new Promise((resolve, reject) => {
    chatGPTQueue.push(
      { chatData },
      queueConsts.USER_INPUT_SCORE,
      false,
      async (data) => {
        if (!data) {
          resolve(null);
        }
        const { data: v } = data;
        const detectedResult = await detectLanguage({
          ...v.chatData,
          model: DEFAULT_MODEL,
        });

        resolve(detectedResult);
      },
      (e) => {
        reject(e);
      },
    );
  });
};

export const getTranslationPrompt = async (request, sender, sendResponse, port) => {
  const prompt = await promptManager.getPrompt();

  const chatData = request.payload;
  const userInputType = getUserInputLengthType(chatData.input_text);
  let useTransChatgpt = null;
  if (userInputType === userInputLengthTypes.SHORT && prompt.SHORT_USER_TEXT_TRANSLATION_BY_CHATGPT) {
    useTransChatgpt = true;
  } else if (userInputType === userInputLengthTypes.LONG && prompt.LONG_USER_TEXT_TRANSLATION_BY_CHATGPT) {
    useTransChatgpt = true;
  } else {
    useTransChatgpt = false;
  }

  let promptedResult = chatData.input_text;
  let translationType = transType.TRANS_GOOGLE;
  if (useTransChatgpt) {
    promptedResult = await promptManager.getUserTextTranslationByChatgptPrompt(chatData.input_text);
    translationType = transType.TRANS_CHAT_GPT;
  }

  return { promptedResult, translationType };
};

const requestConversation = async (request, sender, sendResponse, port) => {
  const { chatData } = request.payload;
  console.log('requestConversation - chatData', chatData);
  const tabId = sender?.tab?.id;
  chatGPTQueue.push(
    chatData,
    commonConsts.CONVERSTION_SCORE,
    false,
    async () => {
      await postConversation(abortSignal, chatData, (payload) => {
        sendMessage(tabId, eventType.EVENT_MESSAGE_DOING, payload, port);
      });
    },
    errorCallBack(request.type, sender?.tab?.id, port),
  );
  return true;
};

const requestGoogleTranslation = async (request, sender, sendResponse, port) => {
  const { chatData, sourceLang, targetLang, needTrans, cacheOnly, changeLang } = request.payload;
  const transResult = await translator.googleTranslator({ ...chatData, sourceLang, targetLang, cacheOnly, needTrans, changeLang: !!changeLang });
  return transResult;
};

const requestBatchGoogleTranslation = async (request, sender, sendResponse, port) => {
  const { chatData, sourceLang, targetLang, cacheOnly, score, changeLang } = request.payload;
  console.log('requestBatchGoogleTranslation - changeLang', changeLang);

  return new Promise((resolve, reject) => {
    chatGPTQueue.push(
      chatData,
      score,
      cacheOnly,
      async (data) => {
        if (!data) {
          resolve(null);
        }
        if (!data) {
          resolve(null);
        }
        const { data: v } = data;
        const transResult = await translator.batchGoogleTranslator({ arr: v, sourceLang, targetLang, cacheOnly, changeLang: !!changeLang });
        resolve(transResult);
      },
      (e) => {
        reject(e);
      },
    );
  });
};

const requestChatGPTTranslation = (request, sender, sendResponse, port) => {
  const { chatData, origin_text, sourceLang, targetLang, needTrans, cacheOnly, score } = request.payload;

  return new Promise((resolve, reject) => {
    chatGPTQueue.push(
      chatData,
      score,
      cacheOnly,
      async (data) => {
        if (!data) {
          resolve(null);
        }
        const { data: v } = data;
        const transResult = await translator.chatGTPTranslator({
          ...v,
          origin_text,
          sourceLang,
          targetLang,
          cacheOnly,
          needTrans,
          model: DEFAULT_MODEL,
        });
        resolve(transResult);
      },
      (e) => {
        reject(e);
      },
    );
  });
};

const requestSetDeeplTranslation = async (request, sender, sendResponse, port) => {
  const { messageId, role, english, other, other_lang, source_lang, target_lang } = request.payload;

  return await translator.setDeeplTranslation({ messageId, role, english, other, other_lang, source_lang, target_lang });
};

const requestGetTranslation = async (request, sender, sendResponse, port) => {
  const { messageId, transType, transData } = request.payload;

  return await translator.getTranslation({ messageId, transType, transData });
};

const clearQueue = (request, sender, sendResponse, port) => {
  const { score } = request.payload;
  chatGPTQueue.clear(score);
  return true;
};

export const ChatGPTCoreEventExecutor = {
  [eventType.EVENT_DETECT_LANGUAGE]: requestDetectLanguage,
  [eventType.EVENT_GET_TRANSLATION_PROMPT]: getTranslationPrompt,
  [eventType.EVENT_CLEAR_QUEUE]: clearQueue,
  [eventType.EVENT_GOOGLE_TRANSLATION]: requestGoogleTranslation,
  [eventType.EVENT_BATCH_GOOGLE_TRANSLATION]: requestBatchGoogleTranslation,
  [eventType.EVENT_CHATGPT_TRANSLATION]: requestChatGPTTranslation,
  [eventType.EVENT_SEND_MESSAGE]: requestConversation,
  [eventType.EVENT_STOP_CONVERSATION]: stopConversation,
  [eventType.EVENT_SET_DEEPL_TRANSLATION]: requestSetDeeplTranslation,
  [eventType.EVENT_GET_TRANSLATION]: requestGetTranslation,
};
