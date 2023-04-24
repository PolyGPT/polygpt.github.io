export const ORIGIN_USER = 'ORIGIN_USER';
export const ORIGIN_ASSISTANT = 'ORIGIN_ASSISTANT';

export const TRANS_ENGLISH = 'TRANS_ENGLISH';
export const TRANS_GOOGLE = 'TRANS_GOOGLE';
export const TRANS_CHAT_GPT = 'TRANS_CHAT_GPT';
export const TRANS_DEEPL = 'TRANS_DEEPL';
export const TRANS_DETECT_LANGUAGE = 'TRANS_DETECT_LANGUAGE';

export const TRANS_LANG_OTHER_TYPE = 'other';
export const TRANS_LANG_ENGLISH_TYPE = 'english';

export const DEFAULT_CHATGPT_LANGUAGE = 'en';

export const getChatGPTTransInfo = (text) => {
  const splitedText = text.split('\n')[0].trim();
  const needExpire = splitedText.indexOf('|') !== splitedText.length - 1;

  let normalize = splitedText;
  // 앞에 A: B: 제거
  if (normalize.startsWith('A:') || normalize.startsWith('B:')) {
    normalize = normalize.substring(2);
  }

  // “ 제거
  normalize = normalize.replaceAll(/“/g, '');
  // | 제거
  normalize = normalize.replace('|', '');

  return {
    needExpire,
    result: needExpire ? null : normalize.trim(),
  };
};
