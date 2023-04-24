import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import produce from 'immer';
import { cloneDeep } from 'lodash';
import { uuidv4 } from '../../../../../utils/utils';
import { ROLE_USER_TYPE, ROLE_ASSISTANT_TYPE } from '../../../../../codes/RoleType';
import * as chatGPTCodes from '../../../../../codes/ChatGPT';
import * as queueTypes from '../../../../../codes/Queue';
import * as transTypes from '../../../../../codes/TransType';
import { promptManager } from '../../../../../codes/Prompt';
import { DEFAULT_CHATGPT_LANGUAGE, ORIGIN_USER } from '../../../../../codes/TransType';
import { splitMarkup, joinLineBreak, restoreMarkup } from '../../../../../utils/MarkDownSplitor';
import conversationServices from './services/conversationServices';
import TranslationServices from './services/TranslationServices';
import promptService from './services/promptServices';
import * as userPaymentTypes from '../../../../../codes/UserPaymentTypes';
import { DEFAULT_LANGUAGE } from '../../../../../codes/Prompt';
import configServices from './services/configServices';
import { showToast } from '../utils/utils';
import { getLanguageName } from '../../../../../codes/Languages';
import { removeBracket } from '../../../../../utils/replacer';
import { SERVICE_NAME } from '../../../../../codes/Common';

const showErrorToast = (e) => {
  if (e.status === 403) {
    return;
  }
  if (e.value && e.value.detail) {
    showToast(e.value.detail);
    return;
  }
  showToast(e.message);
};

const createUserMessage = ({ message_id, parent_id, trans_text, input_text }) => {
  return {
    children: [],
    id: message_id,
    message: {
      id: message_id,
      author: {
        role: ROLE_USER_TYPE,
        name: null,
        metadata: {},
      },
      content: {
        content_type: 'text',
        parts: [trans_text || input_text],
      },
      create_time: null,
      end_turn: null,
      recipient: 'all',
      update_time: null,
      weight: 1,
    },
    parent: parent_id,
  };
};

const getChatData = ({
  conversationId,
  messageId,
  parentId,
  text,
  action,
  model,
  model_title,
  regenerateMessage,
  inputLang,
  transType,
  transLang = null,
  role,
}) => {
  return {
    message_id: messageId || uuidv4(),
    role: role,
    is_stop: false,
    parent_id: parentId === '' ? null : parentId,
    conversation_id: conversationId === '' ? null : conversationId,
    trans_text: null,
    trans_lang: transLang,
    trans_type: transType,
    input_lang: inputLang,
    input_text: text,
    regenerate_message: regenerateMessage,
    action,
    model,
    model_title: removeBracket(model_title),
    back: {
      site_type: null,
      lang: null,
      text: null,
    },
  };
};

const getDetectData = (chatData) => {
  const splitChatData = splitMarkup(chatData);
  const detectChatData = splitChatData.filter((data) => data.needTrans === true);

  return {
    role: chatData.role,
    model: chatData.model,
    model_title: chatData.model_title,
    conversation_id: chatData.conversation_id,
    input_text: joinLineBreak(detectChatData.map((data) => restoreMarkup(data.text))),
  };
};

const mergeTranslation = (stateTranslation) => {
  const cloneTranslation = cloneDeep(stateTranslation);

  return (translateResult) => {
    if (translateResult) {
      (Array.isArray(translateResult) ? translateResult : [translateResult]).forEach((t) => {
        cloneTranslation[t.message_id] = cloneTranslation[t.message_id] ?? {};
        cloneTranslation[t.message_id][t.paragraph_seq] = cloneTranslation[t.message_id][t.paragraph_seq] ?? {};
        cloneTranslation[t.message_id][t.paragraph_seq][t.trans_type] = t;
        if (t.trans_type !== transTypes.TRANS_DETECT_LANGUAGE && !cloneTranslation[t.message_id][t.paragraph_seq][transTypes.TRANS_ENGLISH]) {
          cloneTranslation[t.message_id][t.paragraph_seq][transTypes.TRANS_ENGLISH] = t;
        }
      });
    }
    return cloneTranslation;
  };
};

const conversationStore = (set, get) => ({
  config: {},
  isGeneration: false,
  generateMessageId: null,
  isNewChat: false,
  isNewChatDoing: false,
  redirectConversationId: null,
  lastConversationNodeId: null,
  userSession: {},
  conversations: {
    items: [],
    offset: 0,
    total: 0,
  },
  selected_user_language: null,
  conversation: {},
  models: [],
  userPaymentType: userPaymentTypes.CHATGPT_FREE_PLAN,
  model: '',
  modelTitle: '',
  translation: {},
  processTranslation: {},
  prompt: {},
  async init() {
    await get().getConfig();
    await get().getPrompt();
    let config = get().config;
    const prompt = get().prompt;
    if (!config || Object.values(config).length === 0) {
      await get().updateConfig({
        user_language: DEFAULT_LANGUAGE,
      });
    }

    const response = await get().getModels();
    if (response && response.isChanged) {
      const v = get().userPaymentType === userPaymentTypes.CHATGPT_PLUS_PLAN;
      await get().updateConfig({
        ...get().config,
      });
      await get().setPrompt({
        ...prompt,
        // LANGUAGE_DETECTION_BY_CHATGPT: true,
        // ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT: false,
      });
    }
  },
  async switchTranslation(messageId, seq, doing) {
    set(
      produce((state) => ({
        processTranslation: {
          ...state.processTranslation,
          [messageId]: {
            ...(state.processTranslation[messageId] ?? {}),
            [seq]: doing,
          },
        },
      })),
    );
  },
  async getPrompt() {
    try {
      const prompt = await promptService.getPrompt();
      if (prompt) {
        set(
          produce((state) => ({
            prompt: prompt,
          })),
        );
      }
      return prompt;
    } catch (e) {
      showErrorToast(e);
    }
  },
  async setPrompt(prompt) {
    try {
      await promptService.setPrompt(prompt);
    } catch (e) {
      showErrorToast(e);
    }
    get().getPrompt();
  },
  async updateConfig(config) {
    try {
      await configServices.setConfig({ data: config });
    } catch (e) {
      showErrorToast(e);
    }
    get().getConfig();
  },
  async getConfig() {
    try {
      const response = await configServices.getConfig();
      if (response) {
        set(
          produce((state) => ({
            config: response,
          })),
        );
      }
    } catch (e) {
      showErrorToast(e);
    }
  },
  async resetConfigs() {
    await get().updateConfig(null);
    await get().setPrompt(null);
    await get().init();
    const prompt = await get().getPrompt();
    console.log('resetConfigs - ', prompt);
    await get().setPrompt(prompt);
  },
  async exportConfigs() {
    const config = await configServices.getConfig();
    const prompt = await promptService.getPrompt();
    const result = {
      common: config,
      chatgpt: prompt,
    };
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'text/json' });
    return blob;
  },
  async importConfigs(json) {
    const { chatgpt, common } = json;
    if (chatgpt) {
      get().setPrompt(chatgpt);
    }
    if (common) {
      get().updateConfig(common);
    }
  },
  async getUserSession() {
    try {
      const response = await conversationServices.getUserSession();
      set(
        produce((state) => ({
          userSession: response,
        })),
      );

      await get().getConversations({ offset: 0 });
    } catch (e) {
      showErrorToast(e);
    }
  },
  async getModels() {
    try {
      const response = await conversationServices.getModels();
      set(
        produce((state) => ({
          models: response.models,
          userPaymentType: response.userPaymentType,
        })),
      );
      return response;
    } catch (e) {
      showErrorToast(e);
    }
  },
  setLanguage(language) {
    set(
      produce((state) => ({
        language: language,
      })),
    );
  },
  clearConversations() {
    set(
      produce((state) => ({
        conversations: {
          items: [],
          offset: 0,
          total: 0,
        },
      })),
    );
  },
  setLastConversationNode({ selectId }) {
    const { mapping } = get().conversation;

    const getLastNode = (id) => {
      if (!mapping[id] || !mapping[id].children) {
        return id;
      }

      const childrenCount = mapping[id].children.length;
      if (childrenCount === 0) {
        return id;
      }

      return getLastNode(mapping[id].children[childrenCount - 1]);
    };

    let lastNodeId = getLastNode(selectId);
    set(
      produce((state) => ({
        lastConversationNodeId: lastNodeId,
      })),
    );
  },
  async getConversations({ offset = 20, limit = 20 } = { limit: 20, offset: 20 }) {
    try {
      const response = await conversationServices.getConversations({
        offset: get().conversations.offset + offset,
        limit: limit,
      });
      if (response.items) {
        if (response.offset === 0) {
          get().clearConversations();
        }
        const items = [...get().conversations.items, ...response.items];
        set(
          produce((state) => ({
            conversations: {
              ...response,
              items: items,
            },
          })),
        );
      }
    } catch (e) {
      showErrorToast(e);
    }
  },
  async setModelTitle({ model }) {
    if (get().models.length === 0) {
      await get().getModels();
    }
    for (let i = 0; i < get().models.length; i++) {
      if (get().models[i].slug === model) {
        set(
          produce((state) => ({
            modelTitle: get().models[i].title,
          })),
        );
        return;
      }
    }
  },
  async getConversation({ id }) {
    set(
      produce((state) => ({
        conversation: {},
        redirectConversationId: null,
        isGeneration: false,
      })),
    );
    let response = null;
    try {
      response = await conversationServices.getConversation({ id });
    } catch (e) {
      showErrorToast(e);
      throw e;
    }

    if (response.detail) {
      return;
    }

    const model = Object.values(response.mapping).reduce((prev, curr) => {
      if (prev !== '') {
        return prev;
      }
      if (curr.message && curr.message.metadata && curr.message.metadata.model_slug) {
        if (curr.message.metadata.model_slug !== '') {
          return curr.message.metadata.model_slug;
        }
      }
      return prev;
    }, '');

    set(
      produce((state) => ({
        model: model,
        lastConversationNodeId: response.current_node,
        isNewChat: false,
        redirectConversationId: null,
        conversation: response,
      })),
    );

    await get().setModelTitle({ model: model });

    if (response.title && response.title.indexOf(SERVICE_NAME) === -1) {
      const { user_language } = get().config;
      const messages = [];
      const getRole = (message) => {
        if (message && message?.author) {
          return message.author?.role;
        }
        return null;
      };

      const { mapping } = response;
      const getNodeKeys = (nodeKey) => {
        if (!nodeKey || !mapping || !mapping[nodeKey] || !mapping[nodeKey].message) {
          return [];
        }
        if (mapping[nodeKey].message.author.role === ROLE_USER_TYPE || mapping[nodeKey].message.author.role === ROLE_ASSISTANT_TYPE) {
          return [nodeKey, ...getNodeKeys(mapping[nodeKey].parent)];
        } else {
          return [];
        }
      };
      const nodeSorting = getNodeKeys(response.current_node).reverse();

      nodeSorting.forEach((key, index) => {
        const chat = mapping[key];
        const role = getRole(chat.message);
        if (role !== null) {
          if (chat.message?.content?.parts[0] && chat.message.content.parts[0] !== '') {
            messages.push({
              conversationId: id,
              messageId: chat.message.id,
              text: chat.message.content.parts[0],
              role: chat.message.author.role,
              model: get().model,
              model_title: get().modelTitle,
              inputLang: DEFAULT_CHATGPT_LANGUAGE,
              transLang: get().selected_user_language || user_language,
            });
          }
        }
      });

      const transChatData = messages.map((msg) => {
        return splitMarkup(getChatData(msg));
      });

      // TODO: 페이지 이동했을때 지금 돌고있는거 싹 날릴수있게 할 방법 고민해보기 (try catch)
      try {
        await conversationServices.clearQueue(queueTypes.TRANSLATION_SCORE);
      } catch (e) {}

      const hasTranslation = (message_id, paragraph_seq, trans_type) => {
        if (get().translation) {
          if (get().translation[message_id]) {
            if (get().translation[message_id][paragraph_seq]) {
              if (get().translation[message_id][paragraph_seq][trans_type]) {
                return true;
              }
            }
          }
        }
        return false;
      };

      (async (transChatData) => {
        for (const arr of transChatData) {
          for (const transType of [transTypes.TRANS_GOOGLE, transTypes.TRANS_DEEPL, transTypes.TRANS_CHAT_GPT]) {
            if (!hasTranslation(arr[0].message_id, 0, transType)) {
              TranslationServices.getTranslation({
                messageId: arr[0].message_id,
                transData: arr,
                transType: transType,
              })
                .then((transResult) => {
                  if (transResult) {
                    console.log(`${transResult[0].trans_type}`, transResult);
                    set(
                      produce((state) => ({
                        translation: mergeTranslation(state.translation)(transResult),
                      })),
                    );
                  }
                })
                .catch((e) => {
                  showErrorToast(e);
                });
            }
          }
        }
      })(transChatData);
    }
  },
  async deleteConversation({ id }) {
    try {
      const result = await conversationServices.deleteConversation({ id });
      console.log('result', result);
    } catch (e) {
      showErrorToast(e);
    }

    const { offset } = get().conversations;
    get().clearConversations();
    await get().getConversations({
      offset: 0,
      limit: offset + 20,
    });
  },
  async updateConversationTitle({ id, title }) {
    try {
      await conversationServices.updateConversationTitle({ id, title });
    } catch (e) {
      showErrorToast(e);
    }

    const { offset } = get().conversations;

    await get().getConversations({
      offset: 0,
      limit: offset + 20,
    });
  },
  async appendUserMessage(userMessage) {
    const conversation = { ...get().conversation };
    console.log('userMessage', userMessage);

    const { id, message, parent } = userMessage;

    if (get().isNewChat === true) {
      set(
        produce((state) => ({
          isGeneration: true,
          lastConversationNodeId: id,
          conversation: {
            mapping: {
              [id]: userMessage,
            },
            current_node: id,
            title: 'New Chat',
          },
        })),
      );
    } else if (conversation.mapping[parent].children.indexOf(id) === -1) {
      if (!message || !parent) {
        return;
      }
      set(
        produce((state) => ({
          isGeneration: true,
          lastConversationNodeId: id,
          conversation: {
            ...state.conversation,
            mapping: {
              ...state.conversation.mapping,
              [id]: userMessage,
              [parent]: {
                ...state.conversation.mapping[parent],
                children: [...(state.conversation.mapping[parent].children || []), id],
              },
            },
            current_node: id,
          },
        })),
      );
    }
  },
  async sendMessage({ conversationId, parentId, text, transLang, isNewChat = false } = { isNewChat: false }) {
    set(
      produce((state) => ({
        isNewChat: isNewChat,
        isGeneration: true,
      })),
    );

    const currentNode = get().conversation.current_node;

    const rollback = (chatData) => {
      set(
        produce((state) => {
          const conversation = cloneDeep(state.conversation);
          conversation.current_node = currentNode;
          delete conversation.mapping[chatData.message_id];
          const index = conversation.mapping[chatData.parent_id].children.indexOf(chatData.message_id);
          if (index !== -1) {
            conversation.mapping[chatData.parent_id].children.splice(index, 1);
          }

          return {
            lastConversationNodeId: currentNode,
            conversation,
            isGeneration: false,
          };
        }),
      );
    };

    const { user_language } = get().config;

    const model = get().model;
    if (!model) {
      showErrorToast(new Error('Model Not Found !'));
      return;
    }

    const chatData = getChatData({
      action: chatGPTCodes.CONVERSACTION_ACTION,
      model: model,
      model_title: get().modelTitle,
      parentId,
      conversationId,
      text,
      transLang: transLang || DEFAULT_CHATGPT_LANGUAGE,
      transType: ORIGIN_USER,
      role: ROLE_USER_TYPE,
      inputLang: get().selected_user_language || user_language,
    });

    get().appendUserMessage(createUserMessage(chatData));
    let detectResult = null;
    try {
      detectResult = await TranslationServices.detectLanguage(getDetectData(chatData));
      detectResult = detectResult.trim();
    } catch (e) {
      showErrorToast(e);
      rollback(chatData);
      return false;
    }

    set(
      produce((state) => ({
        translation: mergeTranslation(state.translation)({
          english: detectResult === DEFAULT_CHATGPT_LANGUAGE ? text : '',
          other: detectResult !== DEFAULT_CHATGPT_LANGUAGE ? text : '',
          message_id: chatData.message_id,
          role: chatData.role,
          paragraph_seq: 0,
          other_lang: detectResult,
          trans_type: transTypes.TRANS_DETECT_LANGUAGE,
        }),
      })),
    );

    console.log('detectResult === DEFAULT_CHATGPT_LANGUAGE', detectResult, DEFAULT_CHATGPT_LANGUAGE, detectResult === DEFAULT_CHATGPT_LANGUAGE);

    if (detectResult.trim() === DEFAULT_CHATGPT_LANGUAGE) {
      (async function (chatData) {
        try {
          let translateResult = await TranslationServices.googleTranslation({
            chatData,
            sourceLang: detectResult,
            targetLang: get().selected_user_language || user_language,
            needTrans: true,
            cacheOnly: false,
          });

          set(
            produce((state) => ({
              translation: mergeTranslation(state.translation)(translateResult),
            })),
          );
        } catch (e) {
          set(
            produce((state) => {
              const translation = cloneDeep(state.translation);
              delete translation[chatData.message_id][0][transTypes.TRANS_DETECT_LANGUAGE];
              return {
                translation,
              };
            }),
          );
          showErrorToast(e);
          // rollback(chatData);
        }
      })(chatData);
    } else {
      try {
        const { promptedResult, translationType } = await TranslationServices.getTranslationPrompt(chatData);
        console.log('promptedResult - ', promptedResult);

        let translateResult = null;
        if (translationType === transTypes.TRANS_GOOGLE) {
          translateResult = await TranslationServices.googleTranslation({
            chatData,
            sourceLang: detectResult,
            targetLang: DEFAULT_CHATGPT_LANGUAGE,
            needTrans: true,
            cacheOnly: false,
            changeLang: true,
          });
        } else if (translationType === transTypes.TRANS_CHAT_GPT) {
          try {
            translateResult = await TranslationServices.chatGPTTranslation({
              chatData: {
                ...chatData,
                input_text: promptedResult,
                paragraph_seq: 0,
              },
              sourceLang: detectResult,
              targetLang: DEFAULT_CHATGPT_LANGUAGE,
              needTrans: true,
              cacheOnly: false,
              origin_text: chatData.input_text,
            });
          } catch (error) {
            console.error('Error: ', error);
            translateResult = await TranslationServices.googleTranslation({
              chatData,
              sourceLang: detectResult,
              targetLang: DEFAULT_CHATGPT_LANGUAGE,
              needTrans: true,
              cacheOnly: false,
            });
          }
        } else {
          throw new Error(`Invalid Translation Type ${translationType}`);
        }

        console.log('translateResult - ', translateResult);

        set(
          produce((state) => ({
            translation: mergeTranslation(state.translation)(translateResult),
          })),
        );
        chatData.trans_text = translateResult.english;
      } catch (e) {
        console.error(e);
        showErrorToast(e);
        // rollback(chatData);
        set(
          produce((state) => {
            const translation = cloneDeep(state.translation);
            delete translation[chatData.message_id][0][transTypes.TRANS_DETECT_LANGUAGE];
            return {
              translation,
            };
          }),
        );
      }
    }
    console.log('store - chatData', chatData);
    try {
      const conversationResult = await conversationServices.sendMessage(chatData);
      console.log('conversationResult - ', conversationResult);
    } catch (e) {
      showErrorToast(e);
      rollback(chatData);

      return false;
    }
    return true;
  },
  async sendNewMessage({ text, transLang, model }) {
    if (!model) {
      showErrorToast(new Error('Model Not Found !'));
      return false;
    }
    set(
      produce((state) => ({
        isNewChatDoing: true,
        isGeneration: true,
        redirectConversationId: null,
        model,
      })),
    );

    (async function () {
      await get().setModelTitle({ model: model });

      const result = await get().sendMessage({ conversationId: null, parentId: null, text, transLang, isNewChat: true });

      if (result === false) {
        set(
          produce((state) => ({
            isNewChatDoing: false,
            isGeneration: false,
          })),
        );
      }
    })();

    return;
  },
  async insertMessage({ conversationId, parentId, text, transLang, inputLang }) {
    try {
      await get().sendMessage({ conversationId, parentId, text, transLang, inputLang });
    } catch (e) {
      showErrorToast(e);
    }
  },
  async stopGenerating() {
    try {
      await conversationServices.stopGenerating({});
    } catch (e) {
      showErrorToast(e);
    }
  },
  async regenerate({ conversationNode, conversationId }) {
    set(
      produce((state) => ({
        isGeneration: true,
      })),
    );

    conversationServices.regenerate(
      getChatData({
        action: chatGPTCodes.RE_GEN_CONVERSACTION_ACTION,
        model: get().model,
        model_title: get().modelTitle,
        parentId: conversationNode.parent,
        messageId: conversationNode.id,
        conversationId,
        regenerateMessage: [conversationNode.message],
        role: ROLE_USER_TYPE,
        inputLang: get().selected_user_language,
      }),
    );
  },
  async sendFeedback({ conversationId, messageId, rating, text, tags }) {
    try {
      await conversationServices.sendFeedback({
        conversationId,
        messageId,
        rating,
        text,
        tags,
      });
    } catch (e) {
      showErrorToast(e);
    }
  },

  async sendDeeplTranslation(conversationId, message, deeplTranslation) {
    const detectLang = async (conversationId, messageId, text) => {
      const transChatData = getChatData({
        conversationId: conversationId,
        text: text,
        messageId: messageId,
        model: get().model,
        model_title: get().modelTitle,
        role: ROLE_ASSISTANT_TYPE,
      });
      const detectResult = await TranslationServices.detectLanguage(getDetectData(transChatData));
      return detectResult;
    };

    const text = message.content.parts[0];
    const textLanguageDetect = await detectLang(conversationId, message.id, text);
    const transLanguageDetect = await detectLang(conversationId, message.id, deeplTranslation);

    if (transLanguageDetect === textLanguageDetect) {
    } else {
      if (textLanguageDetect === DEFAULT_CHATGPT_LANGUAGE || transLanguageDetect === DEFAULT_CHATGPT_LANGUAGE) {
        await TranslationServices.setDeeplTranslation({
          messageId: message.id,
          role: message.author.role,
          english: textLanguageDetect === DEFAULT_CHATGPT_LANGUAGE ? text : deeplTranslation,
          other: textLanguageDetect === DEFAULT_CHATGPT_LANGUAGE ? deeplTranslation : text,
          other_lang: textLanguageDetect === DEFAULT_CHATGPT_LANGUAGE ? transLanguageDetect : textLanguageDetect,
          source_lang: textLanguageDetect,
          target_lang: transLanguageDetect,
        });

        const chatData = getChatData({
          conversationId: conversationId,
          text: text,
          inputLang: textLanguageDetect,
          transType: transTypes.TRANS_DEEPL,
          messageId: message.id,
          model: get().model,
          model_title: get().modelTitle,
          role: message.author.role,
        });
        const splitTransData = splitMarkup(chatData);

        const deepLTransResult = await TranslationServices.getTranslation({
          messageId: message.id,
          transType: transTypes.TRANS_DEEPL,
          transData: splitTransData,
        });

        set(
          produce((state) => ({
            translation: mergeTranslation(state.translation)(deepLTransResult),
          })),
        );
      }
    }
  },

  async sendGoogleTranslation(conversationId, message) {
    const { user_language } = get().config;
    if (get().translation[message.id]) {
      if (get().translation[message.id][0] && get().translation[message.id][0][transTypes.TRANS_GOOGLE]) {
        return;
      }
    }
    const chatData = getChatData({
      conversationId: conversationId,
      text: message.content.parts[0],
      messageId: message.id,
      model: get().model,
      model_title: get().modelTitle,
      role: message.author.role,
    });

    const transData = splitMarkup(chatData);
    transData.forEach((transItem, index) => {
      get().switchTranslation(message.id, index, true);
    });

    try {
      const detectResult = await TranslationServices.detectLanguage(getDetectData(chatData));
      const targetLang = detectResult === DEFAULT_CHATGPT_LANGUAGE ? user_language : DEFAULT_CHATGPT_LANGUAGE;
      const sourceLang = detectResult;

      console.log('detectResult - ', detectResult);

      transData.forEach((data, index) => {
        set(
          produce((state) => ({
            translation: mergeTranslation(state.translation)({
              english: detectResult === DEFAULT_CHATGPT_LANGUAGE ? data.text : '',
              other: detectResult !== DEFAULT_CHATGPT_LANGUAGE ? data.text : '',
              message_id: data.message_id,
              role: data.role,
              paragraph_seq: index,
              other_lang: sourceLang === DEFAULT_CHATGPT_LANGUAGE ? sourceLang : targetLang,
              trans_type: transTypes.TRANS_DETECT_LANGUAGE,
            }),
          })),
        );
      });

      const googleTransResult = await TranslationServices.batchGoogleTranslation({
        chatData: transData,
        sourceLang: sourceLang,
        targetLang,
        score: queueTypes.TRANSLATION_AT_NOW_CONVERSATION_SCORE,
        cacheOnly: false,
      });
      set(
        produce((state) => ({
          translation: mergeTranslation(state.translation)(googleTransResult),
        })),
      );
    } catch (e) {
      showErrorToast(e);
    } finally {
      transData.forEach((chatData, index) => {
        get().switchTranslation(message.id, index, false);
      });
    }
  },

  async sendChatGPTTranslation(conversation_id, message) {
    const { user_language } = get().config;

    const transChatData = getChatData({
      conversationId: conversation_id,
      text: message.content.parts[0],
      messageId: message.id,
      model: get().model,
      model_title: get().modelTitle,
      role: ROLE_ASSISTANT_TYPE,
    });

    const splitedData = splitMarkup(transChatData);
    let isTranslating = false;
    splitedData.forEach((data) => {
      if (
        !get().translation[message.id] ||
        !get().translation[message.id][data.paragraph_seq] ||
        !get().translation[message.id][data.paragraph_seq][transTypes.TRANS_CHAT_GPT]
      ) {
        get().switchTranslation(message.id, data.paragraph_seq, true);
        isTranslating = true;
      }
    });
    if (!isTranslating) {
      return;
    }

    try {
      const detectResult = await TranslationServices.detectLanguage(getDetectData(transChatData));
      const targetLang = detectResult === DEFAULT_CHATGPT_LANGUAGE ? user_language : DEFAULT_CHATGPT_LANGUAGE;
      const sourceLang = detectResult;

      console.log('detectResult - ', detectResult);
      splitedData.forEach((chatData) => {
        set(
          produce((state) => ({
            translation: mergeTranslation(state.translation)({
              english: detectResult === DEFAULT_CHATGPT_LANGUAGE ? chatData.text : '',
              other: detectResult !== DEFAULT_CHATGPT_LANGUAGE ? chatData.text : '',
              message_id: chatData.message_id,
              role: chatData.role,
              paragraph_seq: chatData.paragraph_seq,
              other_lang: sourceLang === DEFAULT_CHATGPT_LANGUAGE ? sourceLang : targetLang,
              trans_type: transTypes.TRANS_DETECT_LANGUAGE,
            }),
          })),
        );
      });
      for (let data of splitedData) {
        if (get().translation[message.id]) {
          if (get().translation[message.id][data.paragraph_seq] && get().translation[message.id][data.paragraph_seq][transTypes.TRANS_CHAT_GPT]) {
            get().switchTranslation(message.id, data.paragraph_seq, false);
            continue;
          }
        }
        const promptedResult = await promptManager.getAssistantTextTranslationByChatGPTPrompt({
          LanguageName: getLanguageName(targetLang),
          text: data.text,
          EntireContent: transChatData.input_text,
        });
        console.log('promptedResult', promptedResult);
        const transResult = await TranslationServices.chatGPTTranslation({
          chatData: {
            ...data,
            input_text: promptedResult,
          },
          origin_text: data.text,
          sourceLang: sourceLang,
          targetLang,
          cacheOnly: false,
          needTrans: data.needTrans,
          score: queueTypes.TRANSLATION_AT_NOW_CONVERSATION_SCORE,
        });
        console.log('chatGPT Trans Result - ', transResult);
        set(
          produce((state) => ({
            translation: mergeTranslation(state.translation)(transResult),
          })),
        );

        get().switchTranslation(message.id, transResult.paragraph_seq, false);
      }
    } catch (e) {
      showErrorToast(e);
    } finally {
      splitedData.forEach((chatData, index) => {
        get().switchTranslation(message.id, index, false);
      });
    }
  },
  async responseChatGTPMesssage({ chatGPTMessage }) {
    const { msg, parent, isDone } = chatGPTMessage;
    const resetState = () => {
      console.log('resetState', window.location.hash === '#/', window.location.hash, conversation_id);
      set(
        produce((state) => ({
          redirectConversationId: window.location.hash === '#/' || window.location.hash === '' ? conversation_id : null,
          generateMessageId: null,
          isGeneration: false,
        })),
      );
    };
    if (!msg) {
      resetState();
      return;
    }
    const { message, conversation_id } = msg;
    if (!message || !parent) {
      resetState();
      return;
    }

    if (get().isNewChat === true) {
      set(
        produce((state) => ({
          isNewChat: false,
        })),
      );
      await get().getConversations({ offset: 0 });
    }

    let model = get().model;
    if (model === '') {
      if (message && message.metadata && message.metadata.model_slug) {
        model = message.metadata.model_slug;
        set(
          produce((state) => ({
            model,
          })),
        );
        await get().setModelTitle({ model: model });
      }
    }

    set(
      produce((state) => ({
        isNewChat: false,
        generateMessageId: message.id,
        isGeneration: !isDone,
        conversation: {
          ...state.conversation,
          mapping: {
            ...state.conversation.mapping,
            [message.id]: {
              id: message.id,
              parent: message.id !== parent ? parent : null,
              children: [],
              message: message,
            },
          },
        },
      })),
    );

    const conversation = { ...get().conversation };

    if (conversation && conversation.mapping && conversation.mapping[parent] && conversation.mapping[parent].children.indexOf(message.id) === -1) {
      if (parent !== message.id) {
        set(
          produce((state) => ({
            lastConversationNodeId: message.id,
            generateMessageId: null,
            conversation: {
              ...state.conversation,
              mapping: {
                ...state.conversation.mapping,
                [parent]: {
                  ...state.conversation.mapping[parent],
                  children: [...(state.conversation.mapping[parent].children || []), message.id],
                },
              },
              current_node: message.id,
            },
          })),
        );
      }
    }

    if (isDone) {
      const { user_language } = get().config;

      if (get().isNewChatDoing) {
        try {
          await conversationServices.generateTitle({ conversationId: conversation_id, messageId: message.id });
          await get().getConversations({ offset: 0 });
          set(
            produce((state) => ({
              isNewChatDoing: false,
            })),
          );
        } catch (e) {
          showErrorToast(e);
        }
      }

      const transChatData = getChatData({
        conversationId: conversation_id,
        text: message.content.parts[0],
        messageId: message.id,
        model: get().model,
        model_title: get().modelTitle,
        role: ROLE_ASSISTANT_TYPE,
      });
      const splitedData = splitMarkup(transChatData);
      splitedData.forEach((chatData, index) => {
        get().switchTranslation(message.id, index, true);
      });

      try {
        const detectResult = await TranslationServices.detectLanguage(getDetectData(transChatData));
        const targetLang = detectResult === DEFAULT_CHATGPT_LANGUAGE ? get().selected_user_language || user_language : DEFAULT_CHATGPT_LANGUAGE;
        const sourceLang = detectResult;

        console.log('detectResult - ', detectResult);

        const splitedData = splitMarkup(transChatData);
        console.log('splitedData - ', splitedData);
        splitedData.forEach((chatData, index) => {
          set(
            produce((state) => ({
              translation: mergeTranslation(state.translation)({
                english: detectResult === DEFAULT_CHATGPT_LANGUAGE ? chatData.text : '',
                other: detectResult !== DEFAULT_CHATGPT_LANGUAGE ? chatData.text : '',
                message_id: chatData.message_id,
                role: chatData.role,
                paragraph_seq: index,
                other_lang: sourceLang === DEFAULT_CHATGPT_LANGUAGE ? sourceLang : targetLang,
                trans_type: transTypes.TRANS_DETECT_LANGUAGE,
              }),
            })),
          );
        });

        const googleTransResult = await TranslationServices.batchGoogleTranslation({
          chatData: splitedData,
          sourceLang: sourceLang,
          targetLang,
          score: queueTypes.TRANSLATION_AT_NOW_CONVERSATION_SCORE,
          cacheOnly: false,
        });
        set(
          produce((state) => ({
            translation: mergeTranslation(state.translation)(googleTransResult),
          })),
        );
        console.log('googleTransResult - ', googleTransResult);

        const { ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT } = get().prompt;
        console.log('ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT', ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT);
        if (!ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT) {
          return;
        }
        console.log('splitedData', splitedData);
        for (let data of splitedData) {
          const promptedResult = await promptManager.getAssistantTextTranslationByChatGPTPrompt({
            LanguageName: getLanguageName(targetLang),
            text: data.text,
            EntireContent: transChatData.input_text,
          });
          const transResult = await TranslationServices.chatGPTTranslation({
            chatData: {
              ...data,
              input_text: promptedResult,
            },
            origin_text: data.text,
            sourceLang: sourceLang,
            targetLang,
            cacheOnly: false,
            needTrans: data.needTrans,
            score: queueTypes.TRANSLATION_AT_NOW_CONVERSATION_SCORE,
          });
          console.log('chatGPT Trans Result - ', transResult);
          set(
            produce((state) => ({
              translation: mergeTranslation(state.translation)(transResult),
            })),
          );
          get().switchTranslation(message.id, transResult.paragraph_seq, false);
        }
      } catch (e) {
        showErrorToast(e);
      } finally {
        resetState();
        splitedData.forEach((chatData, index) => {
          get().switchTranslation(message.id, index, false);
        });
      }
    }
  },
});

const useConversationStore = create(process.env.NODE_ENV === 'development' ? devtools(conversationStore) : conversationStore);

export default useConversationStore;
