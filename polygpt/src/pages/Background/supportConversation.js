import { postConversation } from './core';
import API from './api';
import { uuidv4 } from '../../utils/utils';
import { ROLE_SYSTEM, ROLE_USER_TYPE } from '../../codes/RoleType';
import * as chatGPTCodes from '../../codes/ChatGPT';
import { promptManager } from '../../codes/Prompt';
import { SERVICE_NAME } from '../../codes/Common';

import * as storageKeys from '../../codes/Storage';
import { LocalStorageAPI } from '../../utils/storage';

const RETRY_COUNT = 3;

const getChatData = ({ conversationId, parentId, text, action, model, regenerateMessage, transLang = null }) => {
  return {
    message_id: uuidv4(),
    role: ROLE_USER_TYPE,
    is_stop: false,
    parent_id: parentId || null,
    conversation_id: conversationId || null,
    trans_text: null,
    trans_lang: transLang,
    input_lang: navigator.language,
    input_text: text,
    regenerate_message: regenerateMessage,
    action: chatGPTCodes.CONVERSACTION_ACTION,
    model,
    back: {
      site_type: null,
      lang: null,
      text: null,
    },
  };
};

const supportConversationKey = () => {
  return `${storageKeys.SUPPORT_CONVERSATION_INFO}`;
};

const supportConversationTitle = () => {
  return `${SERVICE_NAME}`;
};

export const supportConversationManager = (function () {
  const setIds = async ({ supportConversationId, parentId }) => {
    await LocalStorageAPI.set(supportConversationKey(), {
      supportConversationId,
      parentId,
    });
  };

  const getSystemId = (conversation) => {
    const { mapping, current_node } = conversation;
    const getSystem = (id) => {
      const { message, parent } = mapping[id];
      if (!message.author) {
        return null;
      }
      if (message.author.role === ROLE_SYSTEM) {
        return id;
      } else {
        return getSystem(parent);
      }
    };

    return getSystem(current_node);
  };

  const checkSupportConversation = async (accessToken) => {
    const { items } = await API.getConversations(accessToken, 0, 20);
    const polyGPTConversations = items.filter((conversation) => conversation.title === supportConversationTitle());
    if (!polyGPTConversations || polyGPTConversations.length === 0) {
      return {
        conversationId: null,
        parentId: null,
      };
    }
    const sorted = polyGPTConversations.sort((a, b) => Date.parse(b.create_time) - Date.parse(a.create_time))[0];
    const conversationId = sorted.id;
    const detail = await API.getConversation(accessToken, conversationId);

    if (!detail) {
      return {
        conversationId: null,
        parentId: null,
      };
    }

    const parentId = getSystemId(detail);

    if (!parentId) {
      return {
        conversationId: null,
        parentId: null,
      };
    }

    return {
      conversationId,
      parentId: parentId,
    };
  };

  const preProcess = async (accessToken, model) => {
    const data = await LocalStorageAPI.get(supportConversationKey());
    if (data && data.supportConversationId && data.parentId) {
      return {
        conversationId: data.supportConversationId,
        parentId: data.parentId,
      };
    }

    const { conversationId: checkedConversationId, parentId: checkedParentId } = await checkSupportConversation(accessToken);
    if (checkedConversationId && checkedParentId) {
      return {
        conversationId: checkedConversationId,
        parentId: checkedParentId,
      };
    }

    const chatData = getChatData({
      text: await promptManager.getSupportConversationOpenPrompt(),
      model,
    });

    let result = null;
    await postConversation(null, chatData, (payload) => {
      if (payload.isDone) {
        result = payload.msg;
      }
    });
    if (result.message?.content?.parts?.[0] !== '|') {
      console.error('support conversation create failed', result);
      throw new Error(`support conversation create failed: ${JSON.stringfy(result)}`);
    }
    const conversationId = result.conversation_id;

    const detail = await API.getConversation(accessToken, conversationId);
    const systemId = getSystemId(detail);

    await setIds({ supportConversationId: conversationId, parentId: systemId });
    await API.updateConversation(accessToken, conversationId, supportConversationTitle());

    return {
      conversationId: conversationId,
      parentId: systemId,
    };
  };

  return {
    detectLang: async ({ accessToken, text, model }) => {
      for (let i = 0; i < RETRY_COUNT; i++) {
        try {
          const { conversationId, parentId } = await preProcess(accessToken, model);
          const chatData = getChatData({
            parentId: parentId,
            conversationId: conversationId,
            text: await promptManager.getDetectLangPrompt(text),
            model,
          });

          let result = null;
          await postConversation(null, chatData, (payload) => {
            if (payload.isDone) {
              result = payload.msg;
            }
          });

          return { text: result.message?.content?.parts?.[0] };
        } catch (e) {
          await LocalStorageAPI.remove(supportConversationKey());
          console.log('remove PolyGPT room', supportConversationKey());
          if (i === 1) {
            throw e;
          }
        }
      }
    },
    translation: async ({ accessToken, text, model }) => {
      for (let i = 0; i < RETRY_COUNT; i++) {
        try {
          const { conversationId, parentId } = await preProcess(accessToken, model);

          const transChatData = getChatData({
            parentId: parentId,
            conversationId: conversationId,
            text,
            model,
          });

          let result = null;
          await postConversation(null, transChatData, (payload) => {
            if (payload.isDone) {
              result = payload.msg;
            }
          });

          console.log('translate - result', result);

          return { text: result.message?.content?.parts?.[0] };
        } catch (e) {
          await LocalStorageAPI.remove(supportConversationKey());
          console.log('remove PolyGPT room', supportConversationKey());
          if (i === 1) {
            throw e;
          }
        }
      }
    },
  };
})();
