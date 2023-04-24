import * as eventType from '../../../../../../codes/EventType';
import BackgroundCaller from './BackgroundCaller';

const TranslationServices = {
  googleTranslation({ chatData, sourceLang, targetLang, cacheOnly, needTrans, changeLang, score }) {
    return BackgroundCaller(eventType.EVENT_GOOGLE_TRANSLATION, {
      chatData,
      sourceLang,
      targetLang,
      cacheOnly,
      needTrans,
      score,
      changeLang,
    });
  },
  batchGoogleTranslation({ chatData, sourceLang, targetLang, cacheOnly, changeLang, score }) {
    return BackgroundCaller(eventType.EVENT_BATCH_GOOGLE_TRANSLATION, {
      chatData,
      sourceLang,
      targetLang,
      cacheOnly,
      score,
      changeLang,
    });
  },
  chatGPTTranslation({ chatData, origin_text, sourceLang, targetLang, cacheOnly, needTrans, score }) {
    return BackgroundCaller(eventType.EVENT_CHATGPT_TRANSLATION, {
      chatData,
      sourceLang,
      targetLang,
      cacheOnly,
      needTrans,
      score,
      origin_text,
    });
  },
  setDeeplTranslation({ messageId, role, english, other, other_lang, source_lang, target_lang }) {
    return BackgroundCaller(eventType.EVENT_SET_DEEPL_TRANSLATION, {
      messageId,
      role,
      english,
      other,
      other_lang,
      source_lang,
      target_lang,
    });
  },
  getTranslation({ messageId, transType, transData }) {
    return BackgroundCaller(eventType.EVENT_GET_TRANSLATION, {
      messageId,
      transType,
      transData,
    });
  },
  detectLanguage({ input_text, role, model, conversation_id }) {
    return BackgroundCaller(eventType.EVENT_DETECT_LANGUAGE, {
      input_text,
      role,
      model,
      conversation_id,
    });
  },
  getTranslationPrompt(chatData) {
    return BackgroundCaller(eventType.EVENT_GET_TRANSLATION_PROMPT, chatData);
  },
  searchExtension({ name }) {
    return BackgroundCaller(eventType.EVENT_SEARCH_EXTENSION, {
      name,
    });
  },
};

export default TranslationServices;
