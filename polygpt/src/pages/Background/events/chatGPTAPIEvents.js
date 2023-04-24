import * as eventType from '../../../codes/EventType';
import API from '../api';
import { getLoginInfo } from '../core';
import { LocalStorageAPI } from '../../../utils/storage';
import * as storageKeys from '../../../codes/Storage';

export const getLoginSession = async (request, sender, sendResponse, port) => {
  const info = await getLoginInfo();

  return info;
};

export const getConversations = async (request, sender, sendResponse, port) => {
  const info = await getLoginInfo();
  const result = await API.getConversations(info.accessToken, request.payload.offset, request.payload.limit);

  return result;
};

export const updateConversation = async (request, sender, sendResponse, port) => {
  const info = await getLoginInfo();
  const result = await API.updateConversation(info.accessToken, request.payload.id, request.payload.title);

  return result;
};

export const deleteConversation = async (request, sender, sendResponse, port) => {
  const info = await getLoginInfo();
  const result = await API.deleteConversation(info.accessToken, request.payload.id);

  return result;
};

export const getConversation = async (request, sender, sendResponse, port) => {
  const info = await getLoginInfo();
  const result = await API.getConversation(info.accessToken, request.payload.id);

  return result;
};

export const postMessageFeedback = async (request, sender, sendResponse, port) => {
  const { accessToken } = await getLoginInfo();
  const { messageId, conversationId, rating, text, tags } = request.payload;
  const result = await API.postMessageFeedback(accessToken, messageId, conversationId, rating, text, tags);

  return result;
};

const getUserPaymentType = async (checkResult) => {
  const prevUserType = await LocalStorageAPI.get(storageKeys.USER_PAYMENT_TYPE);
  let isChanged = false;
  if (!prevUserType || prevUserType.account_plan.subscription_plan !== checkResult.account_plan.subscription_plan) {
    isChanged = true;
    await LocalStorageAPI.set(storageKeys.USER_PAYMENT_TYPE, checkResult);
  }
  const userPaymentType = checkResult.account_plan.subscription_plan;
  return {
    userPaymentType,
    isChanged,
  };
};

export const getModelList = async (request, sender, sendResponse, port) => {
  const { accessToken } = await getLoginInfo();
  const response = await Promise.all([API.getModelList(accessToken), API.check(accessToken)]);
  const result = response[0];
  const checkResult = response[1];

  const { userPaymentType, isChanged } = await getUserPaymentType(checkResult);

  return { ...result, userPaymentType, isChanged };
};

export const clearAllConversactions = async (request, sender, sendResponse, port) => {
  const { accessToken } = await getLoginInfo();
  const result = await API.clearAllConversactions(accessToken);

  return result;
};

export const generateTitle = async (request, sender, sendResponse, port) => {
  const { accessToken } = await getLoginInfo();
  const { payload } = request;
  const response = await API.generateChatTitle(accessToken, payload.conversationId, payload.messageId);

  return response;
};

export const ChatGPTAPIEventExecutor = {
  [eventType.EVENT_GET_LOGIN_SESSION]: getLoginSession,
  [eventType.EVENT_CONVERSATIONS]: getConversations,
  [eventType.EVENT_CONVERSATION_UPDATE_TITLE]: updateConversation,
  [eventType.EVENT_CONVERSATION_DELETE]: deleteConversation,
  [eventType.EVENT_CONVERSATION]: getConversation,
  [eventType.EVENT_MESSAGE_FEEDBACK]: postMessageFeedback,
  [eventType.EVENT_GET_MODEL_LIST]: getModelList,
  [eventType.EVENT_CLEAR_ALL_CONVERSATIONS]: clearAllConversactions,
  [eventType.EVENT_GENERATE_TITLE]: generateTitle,
};
