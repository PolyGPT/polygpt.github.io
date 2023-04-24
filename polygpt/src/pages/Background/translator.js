import { joinLineBreak, splitLineBreak } from '../../utils/MarkDownSplitor';
import { supportConversationManager } from './supportConversation';
import * as transTypes from '../../codes/TransType';
import { ROLE_USER_TYPE } from '../../codes/RoleType';
import { translateReplacer } from '../../codes/Prompt';
import { getSyncConfig } from './utils';
import { getLoginInfo } from './core';
import { getTranslateCache, setTranslateCache } from './events/commonEvents';

class GoogleTranslator2 {
  /*
  {
    sentences: [
      {
        trans: '작업자 스크립트의 MIME 유형이 잘못된 경우 발생합니다. ',
        orig: 'Thrown if the MIME type of the worker script is incorrect.',
        backend: 3,
        model_specification: [Array],
        translation_engine_debug_info: [Array],
      },
      {
        trans: '항상 text/javascript여야 합니다(역사적인 이유로 다른 JavaScript MIME 유형이 허용될 수 있음).',
        orig: 'It should always be text/javascript (for historical reasons other JavaScript MIME types may be accepted).',
        backend: 3,
        model_specification: [Array],
        translation_engine_debug_info: [Array],
      },
    ],
    src: 'en',
    spell: {},
  }
  */
  getUrl(sourceText, sourceLang = 'en', targetLang = 'ko') {
    return `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&hl=${targetLang}&dt=t&dt=bd&dj=1&source=icon&tk=748396.748396&q=${encodeURIComponent(
      sourceText,
    )}`;
  }

  async translate(sourceText, sourceLang = 'en', targetLang = 'ko') {
    const url = this.getUrl(sourceText, sourceLang, targetLang);
    const response = await fetch(url);
    const result = await response.json();
    const sentences = result.sentences;
    if (!sentences) {
      throw new Error('Translation Fail');
    }

    return sentences
      .map((data) => {
        return data.trans;
      })
      .join('');
  }
}

export const translator = (function () {
  const googleTranslator = new GoogleTranslator2();

  const batchGoogleTranslation = async (arr, targetLang, cacheOnly = true, sourceLang, changeLang, fn) => {
    const needTrans = [];
    const notTrans = [];
    const { role, message_id } = arr[0];
    arr.forEach((v) => {
      if (v.needTrans) {
        needTrans.push([v.paragraph_seq, v]);
      } else {
        notTrans.push([v.paragraph_seq, v]);
      }
    });

    if (needTrans.length === 0) {
      const result = notTrans.map(([paragraph_seq, data]) => {
        return {
          english: data.input_text,
          other: data.input_text,
          message_id,
          paragraph_seq,
          role: data.role,
          other_lang: null,
          trans_type: transTypes.TRANS_GOOGLE,
        };
      });
      fn && fn(result);
      return result;
    }
    const allText = joinLineBreak(needTrans.map(([index, v]) => v.text));
    const transResult = await googleTranslation({
      input_text: allText,
      message_id: message_id,
      needTrans: true,
      role,
      sourceLang,
      targetLang,
      cacheOnly,
      changeLang,
    });

    if (!transResult) {
      fn && fn(transResult);
      return null;
    }

    let splitedEnglish = [];
    let splitedOther = [];
    if (role === ROLE_USER_TYPE) {
      splitedOther = [transResult.other];
      splitedEnglish = [transResult.english];
    } else {
      splitedOther = splitLineBreak(transResult.other);
      splitedEnglish = splitLineBreak(transResult.english);
    }

    if (splitedOther.length !== splitedEnglish.length) {
      throw new Error('google trans splited and origin length mismatch');
    }

    const mergedResult = [
      ...notTrans.map(([paragraph_seq, data]) => {
        return {
          english: data.text,
          other: data.text,
          message_id,
          paragraph_seq,
          role: data.role,
          other_lang: null,
          trans_type: transTypes.TRANS_GOOGLE,
        };
      }),
    ];

    splitedOther.forEach((v, index) => {
      mergedResult.push({
        paragraph_seq: needTrans[index][1].paragraph_seq,
        english: splitedEnglish[index],
        other: splitedOther[index],
        message_id,

        role: role,
        other_lang: transResult.other_lang,
        trans_type: transTypes.TRANS_GOOGLE,
      });
    });
    const result = mergedResult.sort((a, b) => a.paragraph_seq - b.paragraph_seq);
    fn && fn(result);
    return result;
  };

  const googleTranslation = async ({ input_text, message_id, sourceLang, targetLang, needTrans, role, cacheOnly, changeLang }, fn = null) => {
    changeLang = changeLang ?? false;
    if (!needTrans || targetLang === sourceLang) {
      return {
        english: input_text,
        other: input_text,
        message_id,
        paragraph_seq: 0,
        role: role,
        other_lang: null,
        trans_type: transTypes.TRANS_GOOGLE,
        source_lang: sourceLang,
        target_lang: targetLang,
      };
    }
    const cachedValue = await getTranslateCache({
      trans_type: transTypes.TRANS_GOOGLE,
      message_id: message_id,
      paragraph_seq: 0,
    });
    console.log('cacheValue', cachedValue);
    if (cachedValue) {
      fn && fn(cachedValue);

      return cachedValue;
    }
    if (cacheOnly) {
      return null;
    }
    const transResult = await googleTranslator.translate(input_text, sourceLang, targetLang);
    console.log('googleTranslation - googleTranslation', transResult);
    let result = {};
    // TODO: 나중에 다 바꿔야함 테스트를 위해 임시로 해둔거임
    console.log('changeLang', changeLang);
    result = await setTranslateCache({
      trans_type: transTypes.TRANS_GOOGLE,
      message_id: message_id,
      paragraph_seq: 0,
      other_lang: targetLang === transTypes.DEFAULT_CHATGPT_LANGUAGE ? sourceLang : targetLang,
      english: targetLang === transTypes.DEFAULT_CHATGPT_LANGUAGE ? transResult : input_text,
      other: targetLang === transTypes.DEFAULT_CHATGPT_LANGUAGE ? input_text : transResult,
      role: role,
      source_lang: changeLang === true ? targetLang : sourceLang,
      target_lang: changeLang === true ? sourceLang : targetLang,
    });

    fn && fn(result);

    console.log('googleTranslation - result, transResult', result, transResult);
    return result;
  };

  const chatGTPTranslation = async (
    { input_text, origin_text, message_id, paragraph_seq, model, model_title, role, needTrans, cacheOnly, sourceLang },
    fn = null,
  ) => {
    if (!needTrans) {
      const prevCachedValue =
        paragraph_seq > 0 ? await getTranslateCache({ message_id, trans_type: transTypes.TRANS_CHAT_GPT, paragraph_seq: paragraph_seq - 1 }) : null;
      const afterCachedValue = await getTranslateCache({ message_id, trans_type: transTypes.TRANS_CHAT_GPT, paragraph_seq: paragraph_seq + 1 });

      if (!prevCachedValue && !afterCachedValue) {
        return null;
      }
      return {
        english: origin_text,
        other: origin_text,
        message_id,
        paragraph_seq,
        role: role,
        other_lang: sourceLang,
        trans_type: transTypes.TRANS_CHAT_GPT,
      };
    }
    const cachedValue = await getTranslateCache({ message_id, trans_type: transTypes.TRANS_CHAT_GPT, paragraph_seq });
    if (cachedValue) {
      fn && fn(cachedValue);

      return cachedValue;
    }

    if (cacheOnly) {
      return null;
    }

    console.log('chatGPTTranslation - input_text', input_text);
    const { accessToken } = await getLoginInfo();
    let transResult = null;
    for (let i of [0, 1]) {
      try {
        transResult = (await supportConversationManager.translation({ accessToken, text: input_text, model, model_title })).text;
        break;
      } catch (e) {
        if (i === 1) {
          throw e;
        }
      }
    }

    const replacedTranslateResult = translateReplacer(transResult);
    const config = await getSyncConfig();

    let result = {};
    if (sourceLang === transTypes.DEFAULT_CHATGPT_LANGUAGE) {
      result = await setTranslateCache({
        trans_type: transTypes.TRANS_CHAT_GPT,
        message_id: message_id,
        paragraph_seq: paragraph_seq,
        other_lang: config.user_language,
        english: origin_text,
        other: replacedTranslateResult,
        role: role,
        source_lang: sourceLang,
      });
    } else {
      result = await setTranslateCache({
        trans_type: transTypes.TRANS_CHAT_GPT,
        message_id: message_id,
        paragraph_seq: paragraph_seq,
        other_lang: sourceLang,
        english: replacedTranslateResult,
        other: origin_text,
        role: role,
        source_lang: sourceLang,
      });
    }

    fn && fn(result);

    return result;
  };

  const setDeeplTranslation = async ({ messageId, role, english, other, other_lang, source_lang, target_lang }) => {
    await setTranslateCache({
      trans_type: transTypes.TRANS_DEEPL,
      message_id: messageId,
      paragraph_seq: 0,
      other_lang: other_lang,
      english: english,
      other: other,
      role: role,
      source_lang: source_lang,
      target_lang: target_lang,
    });

    return null;
  };

  const getTranslation = async ({ messageId, transType, transData }) => {
    let translationResult = [];
    if (transType === transTypes.TRANS_CHAT_GPT) {
      for (const data of transData) {
        const { message_id, paragraph_seq, needTrans, role, sourceLang, text } = data;
        if (!needTrans) {
          const prevCachedValue =
            paragraph_seq > 0 ? await getTranslateCache({ message_id: messageId, trans_type: transType, paragraph_seq: paragraph_seq - 1 }) : null;
          const afterCachedValue = await getTranslateCache({ message_id: messageId, trans_type: transType, paragraph_seq: paragraph_seq + 1 });

          if (prevCachedValue || afterCachedValue) {
            translationResult.push({
              english: text,
              other: text,
              message_id,
              paragraph_seq,
              role: role,
              other_lang: sourceLang,
              trans_type: transType,
            });
          }
          continue;
        }

        const cachedValue = await getTranslateCache({ message_id, trans_type: transType, paragraph_seq });

        if (!cachedValue) {
          continue;
        }

        translationResult.push(cachedValue);
      }
    } else {
      const cacheValue = await getTranslateCache({
        trans_type: transType,
        message_id: messageId,
        paragraph_seq: 0,
      });

      if (!cacheValue) {
        return null;
      }

      if (cacheValue.role === ROLE_USER_TYPE) {
        return [cacheValue];
      }

      const needTrans = transData.filter((item) => item.needTrans === true);
      const notTrans = transData.filter((item) => item.needTrans === false);

      const { english, other } = cacheValue;
      const splitedOther = splitLineBreak(other);
      const splitedEnglish = splitLineBreak(english);

      translationResult = [
        ...notTrans.map((item) => ({
          english: item.text,
          other: item.text,
          message_id: messageId,
          paragraph_seq: item.paragraph_seq,
          role: item.role,
          other_lang: null,
          trans_type: transType,
        })),
        ...needTrans.map((item, index) => ({
          english: splitedEnglish[item.trans_type === transTypes.TRANS_DEEPL ? item.paragraph_seq : index],
          other: splitedOther[item.trans_type === transTypes.TRANS_DEEPL ? item.paragraph_seq : index],
          message_id: messageId,
          paragraph_seq: item.paragraph_seq,
          role: item.role,
          other_lang: item.other_lang,
          trans_type: transType,
        })),
      ];
    }

    if (translationResult.length === 0) {
      return null;
    }

    return translationResult;
  };

  return {
    async batchGoogleTranslator({ arr, targetLang, cacheOnly, sourceLang, changeLang }, fn = null) {
      return await batchGoogleTranslation(arr, targetLang, cacheOnly, sourceLang, changeLang, fn);
    },
    async googleTranslator({ input_text, message_id, sourceLang, targetLang, needTrans, role, cacheOnly, changeLang }, fn) {
      return await googleTranslation({ input_text, message_id, targetLang, sourceLang, needTrans, role, cacheOnly, changeLang }, fn);
    },
    async setDeeplTranslation({ messageId, role, english, other, other_lang, source_lang, target_lang }) {
      await setDeeplTranslation({ messageId, role, english, other, other_lang, source_lang, target_lang });
    },
    async getTranslation({ messageId, transType, transData }) {
      return await getTranslation({ messageId, transType, transData });
    },
    async chatGTPTranslator(
      { input_text, origin_text, conversation_id, message_id, paragraph_seq, model, model_title, role, needTrans = true, sourceLang, cacheOnly },
      fn,
    ) {
      return await chatGTPTranslation(
        { input_text, origin_text, conversation_id, message_id, paragraph_seq, model, model_title, role, needTrans, cacheOnly, sourceLang },
        fn,
      );
    },
  };
})();
