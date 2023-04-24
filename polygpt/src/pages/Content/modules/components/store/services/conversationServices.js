import * as eventType from '../../../../../../codes/EventType';
import * as queueConsts from '../../../../../../codes/Queue';
import BackgroundCaller from './BackgroundCaller';

const conversationServices = {
  getUserSession() {
    return BackgroundCaller(eventType.EVENT_GET_LOGIN_SESSION, {});
  },
  getModels() {
    return BackgroundCaller(eventType.EVENT_GET_MODEL_LIST, {});
  },
  getConversations({ offset, limit }) {
    return BackgroundCaller(eventType.EVENT_CONVERSATIONS, { offset, limit });
  },
  updateConversationTitle({ id, title }) {
    return BackgroundCaller(eventType.EVENT_CONVERSATION_UPDATE_TITLE, { id, title });
  },
  deleteConversation({ id }) {
    return BackgroundCaller(eventType.EVENT_CONVERSATION_DELETE, { id });
  },
  getConversation({ id }) {
    return BackgroundCaller(eventType.EVENT_CONVERSATION, { id });
  },
  sendMessage(chatData) {
    return BackgroundCaller(eventType.EVENT_SEND_MESSAGE, { chatData, score: queueConsts.USER_INPUT_SCORE });
  },
  stopGenerating() {
    return BackgroundCaller(eventType.EVENT_STOP_CONVERSATION);
  },
  generateTitle({ conversationId, messageId }) {
    return BackgroundCaller(eventType.EVENT_GENERATE_TITLE, {
      conversationId,
      messageId,
    });
  },
  regenerate(chatData) {
    return BackgroundCaller(eventType.EVENT_SEND_MESSAGE, {
      chatData,
      score: queueConsts.CONVERSTION_SCORE,
    });
  },

  sendFeedback({ conversationId, messageId, rating, text, tags }) {
    return BackgroundCaller(eventType.EVENT_MESSAGE_FEEDBACK, {
      conversationId,
      messageId,
      rating,
      text,
      tags,
    });
  },
  clearQueue(score) {
    return BackgroundCaller(eventType.EVENT_CLEAR_QUEUE, score);
  },
};

export default conversationServices;
