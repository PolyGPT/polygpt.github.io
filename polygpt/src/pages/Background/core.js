import { ROLE_USER_TYPE } from '../../codes/RoleType';
import { uuidv4 } from '../../utils/utils';
import API from './api';
import { cache } from './expireCache';

const LOGIN_INFO = 'LOGIN_INFO';

export const createUserMessage = (messageId, parentId, chatData) => {
  return {
    children: [],
    id: messageId,
    message: {
      id: messageId,
      author: {
        role: ROLE_USER_TYPE,
        name: null,
        metadata: {},
      },
      content: {
        content_type: 'text',
        parts: [chatData.trans_text || chatData.input_text],
      },
      create_time: null,
      end_turn: null,
      recipient: 'all',
      update_time: null,
      weight: 1,
    },
    parent: parentId,
  };
};

export const getLoginInfo = async () => {
  if (cache.get(LOGIN_INFO)) {
    return cache.get(LOGIN_INFO);
  }

  const res = await API.getSession();
  if (!Object.keys(res).length === 0) {
    throw new Error('Before Login ChatGPT');
  }
  cache.set(LOGIN_INFO, res);
  return res;
};

const callBack = (fn, lastData, parentId) => (msg) => {
  if (msg === '[DONE]') {
    fn({
      isDone: true,
      msg: lastData,
      parent: parentId,
    });
    return;
  }
  try {
    const data = JSON.parse(msg);
    lastData = data;
    const text = data.message?.content?.parts?.[0];
    if (text) {
      fn({
        isDone: false,
        msg: data,
        parent: parentId,
      });
    }
  } catch (e) {
    fn({
      isDone: false,
      msg: null,
      parent: parentId,
    });
  }
};

export const postConversation = async (abortSignal, chatData, fn, needWait = false) => {
  let lastData = null;
  console.log('postConversation - chatData', chatData);

  const info = await getLoginInfo();

  const messageId = chatData.message_id || uuidv4();
  const parentId = chatData.parent_id || uuidv4();
  await API.postConversation({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${info.accessToken}`,
    },
    signal: abortSignal,
    body: JSON.stringify({
      action: chatData.action,
      messages: chatData.regenerate_message || [
        {
          id: messageId,
          author: {
            role: chatData.role,
          },
          content: {
            content_type: 'text',
            parts: [chatData.trans_text || chatData.input_text],
          },
        },
      ],
      model: chatData.model,
      parent_message_id: parentId,
      conversation_id: chatData.conversation_id || undefined,
    }),
    callBack: callBack(fn, lastData, messageId),
  }).catch((e) => {
    fn({
      isDone: true,
      msg: lastData,
      parent: parentId,
    });
    throw e;
  });
  return;
};
