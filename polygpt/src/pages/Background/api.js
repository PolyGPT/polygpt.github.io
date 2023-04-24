import { createParser } from 'eventsource-parser';
import { APIError } from '../../utils/exception';

const LOGIN_SESSION_URL = 'https://chat.openai.com/api/auth/session';

const HTTP_METHD_GET = 'GET';
const HTTP_METHD_PATCH = 'PATCH';
const HTTP_METHD_POST = 'POST';

const API = (function (defaultUrl) {
  async function* streamIterator(stream) {
    const streamReader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await streamReader.read();
        if (done) {
          return;
        }
        yield value;
      }
    } finally {
      streamReader.releaseLock();
    }
  }

  const errorMessage = async (response, url) => {
    let json = null;
    try {
      json = await response.json();
    } catch {}

    if (json && json.detail) {
      if (typeof json.detail === 'string') {
        return {
          message: `HTTP Error ${response.status} - ${json.detail}`,
          status: response.status,
        };
      } else if (typeof json.detail === 'object' && json.detail.message) {
        return {
          message: `HTTP Error ${response.status} - ${json.detail.message}`,
          status: response.status,
        };
      }
    }

    return {
      message: `HTTP Error ${response.status} - ${url}`,
      status: response.status,
    };
  };

  const fetchAPI = async (url, requestInfo) => {
    const response = await fetch(url, requestInfo);
    if (response.ok) {
      return await response.json();
    } else {
      const error = await errorMessage(response, url);
      throw new APIError(error.message, error.status);
    }
  };

  const callSSE = async (url, options) => {
    const { callBack, ...fetchOptions } = options;
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      const error = await errorMessage(response, url);
      throw new APIError(error.message, error.status);
    }
    const parser = createParser((e) => {
      if (e.type === 'event') {
        callBack(e.data);
      }
    });
    for await (const chunk of streamIterator(response.body)) {
      parser.feed(new TextDecoder().decode(chunk));
    }
  };

  const getHeader = (token) => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  return {
    // 채팅목록 조회
    // token: getLoginInfo().accessToken
    async getConversations(token, offset = 20, limit = 0) {
      const result = await fetchAPI(`${defaultUrl}/conversations?offset=${offset}&limit=${limit}`, {
        method: HTTP_METHD_GET,
        headers: getHeader(token),
      });

      return result;
    },

    async getSession() {
      const response = await fetchAPI(LOGIN_SESSION_URL);

      if (response === null || Object.keys(response).length === 0) {
        throw new APIError('Unauthorized', 403);
      }

      return response;
    },

    // 채팅방 이름 update
    // token: getLoginInfo().accessToken
    // id: 채팅방 id
    // title: string
    async updateConversation(token, id, title) {
      const result = await fetchAPI(`${defaultUrl}/conversation/${id}`, {
        method: HTTP_METHD_PATCH,
        headers: getHeader(token),
        body: JSON.stringify({
          title,
        }),
      });

      return result;
    },

    // 채팅 제거
    // token: getLoginInfo().accessToken
    // id: 채팅방 id
    async deleteConversation(token, id) {
      const result = await fetchAPI(`${defaultUrl}/conversation/${id}`, {
        method: HTTP_METHD_PATCH,
        headers: getHeader(token),
        body: JSON.stringify({
          is_visible: false,
        }),
      });

      return result;
    },

    // 채팅 상세조회
    // token: getLoginInfo().accessToken
    // id: 채팅방 id
    async getConversation(token, id) {
      const result = await fetchAPI(`${defaultUrl}/conversation/${id}`, {
        method: HTTP_METHD_GET,
        headers: getHeader(token),
      });

      return result;
    },

    // 채팅 생성
    // args: chatData
    async postConversation(...args) {
      return await callSSE(`${defaultUrl}/conversation`, ...args);
    },

    // moderation (정확한 용도 확인 불가)
    // token: getLoginInfo().accessToken
    // conversationId: 채팅방 id
    // text: string
    async moderation(token, conversationId, messageId, text) {
      const response = await fetchAPI(`${defaultUrl}/moderations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          input: text,
          model: 'text-moderation-playground',
          conversation_id: conversationId,
          message_id: messageId,
        }),
      });

      if (!response.moderation_id) {
        throw new Error('Moderation Failed.');
      }
      return response;
    },

    // 채팅방 제목 자동 생성
    // token: getLoginInfo().accessToken
    // id: 채팅방 id
    // messageId: 채팅방에 있는 message_id
    async generateChatTitle(token, conversationId, messageId) {
      const response = await fetchAPI(`${defaultUrl}/conversation/gen_title/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message_id: messageId,
        }),
      });
      console.log('gen finished', response);
      if (!response.title) {
        throw new Error('Generate Failed');
      }
    },

    // 좋아요 싫어요 기능
    // token: getLoginInfo().accessToken
    // messageId: 채팅 id
    // conversationId: 채팅방 id
    // rating:  ChatGPT.js::RATING.[THUMBS_UP THUMBS_DOWN]
    // text: 싫어요 일때 이유 string
    // tags: 싫어요 일때 tags ChatGPT.js::THUMBS_DOWN_TAGS.values
    async postMessageFeedback(token, messageId, conversationId, rating, text = undefined, tags = undefined) {
      const result = await fetchAPI(`${defaultUrl}/conversation/message_feedback`, {
        method: HTTP_METHD_POST,
        headers: getHeader(token),
        body: JSON.stringify({
          message_id: messageId,
          conversation_id: conversationId,
          rating,
          text,
          tags: tags.length >= 1 ? tags : text === '' ? [] : undefined,
        }),
      });
      return result;
    },

    // 사용자가 사용 가능한 모델 목록
    // token: getLoginInfo().accessToken
    async getModelList(token) {
      const result = await fetchAPI(`${defaultUrl}/models`, {
        method: HTTP_METHD_GET,
        headers: getHeader(token),
      });
      return result;
    },

    // 사용자의 모든 채팅 제거
    // token: getLoginInfo().accessToken
    async clearAllConversactions(token) {
      const result = await fetchAPI(`${defaultUrl}/conversations`, {
        method: HTTP_METHD_PATCH,
        headers: getHeader(token),
        body: JSON.stringify({ is_visible: false }),
      });
      return result;
    },

    // 유무료 사용자 정보 조회
    // token: getLoginInfo().accessToken
    async check(token) {
      const result = await fetchAPI(`${defaultUrl}/accounts/check`, {
        method: HTTP_METHD_GET,
        headers: getHeader(token),
      });
      return result;
    },
  };
})('https://chat.openai.com/backend-api');

export default API;
