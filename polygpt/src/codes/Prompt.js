import { getLanguage } from './Languages';
import { SyncStorageAPI } from '../utils/storage';
import * as storageKeys from './Storage';
import { replacer } from '../utils/utils';
import { join, slice, split, trim, replace } from '../utils/replacer';

export const DEFAULT_LANGUAGE = process.env.NODE_ENV === 'test' ? '' : getLanguage(navigator.languages).code;

const DETECT_LANG_PROMPT = `Task: Language Detection
Output: Language code only and add a " |" at the end |

{{text}}`;

const ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT_PROMPT = `Task: Translate to {{LanguageName}}
Goal: Translate input only by referring to the entire contents (Do not translate entire contents, translate only input)
Output: Only translation and add a | at the end. Preserve markdown formatting (e.g., leading number)

Entire contents:
"""
{{EntireContent}}
"""

Input:
{{text}}`;

const USER_TEXT_TRANSLATION_BY_CHTATGPT_PROMPT = `Task: Translate to English
Writer: user
Output: Only translation and add a | at the end. Preserve markdown formatting (e.g., leading number)

{{text}}`;

const SUPPORT_CONVERSATION_OPENING_PROMPT = `Your name is PolyGPT
Your task is language detection, translation and summarization
If you understand, output "|" only`;

export const promptManager = (function () {
  const PROMPT_MAPPINGS = {
    DETECT_LANG_PROMPT,
    ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT_PROMPT,
    USER_TEXT_TRANSLATION_BY_CHTATGPT_PROMPT,
    SUPPORT_CONVERSATION_OPENING_PROMPT,
    ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT: false,
    LANGUAGE_DETECTION_BY_CHATGPT: true,
    LONG_USER_TEXT_TRANSLATION_BY_CHATGPT: false,
    SHORT_USER_TEXT_TRANSLATION_BY_CHATGPT: true,
  };

  const getPrompt = async (key = null) => {
    let prompts = null;
    if (process.env.NODE_ENV === 'test') {
      prompts = { ...PROMPT_MAPPINGS };
    } else {
      prompts = await SyncStorageAPI.get(storageKeys.PROMPT);
    }
    console.log('getPrompt - ', prompts);
    if (!prompts) {
      await SyncStorageAPI.set(storageKeys.PROMPT, PROMPT_MAPPINGS);
      return key ? PROMPT_MAPPINGS[key] : PROMPT_MAPPINGS;
    } else {
      return key ? prompts[key] : prompts;
    }
  };

  const setPrompt = async (prompt) => {
    await SyncStorageAPI.set(storageKeys.PROMPT, prompt);
  };

  const userInputTranslationReplacer = (text) => replacer([replace('{{text}}', text)]);

  return {
    getPrompt: async () => {
      return await getPrompt();
    },
    setPrompt: async (prompt) => {
      return await setPrompt(prompt);
    },
    getDetectLangPrompt: async (text) => {
      const prompt = await getPrompt('DETECT_LANG_PROMPT');
      if (text.indexOf('\n') !== -1) {
        text = text.split('\n')[0];
      } else {
        text = text.split(' ').splice(0, 35);
        text = text.join(' ');
      }
      return prompt.replace('{{text}}', text);
    },
    getUserTextTranslationByChatgptPrompt: async (text) => {
      const prompt = await getPrompt('USER_TEXT_TRANSLATION_BY_CHTATGPT_PROMPT');
      return userInputTranslationReplacer(text)(prompt);
    },
    getAssistantTextTranslationByChatGPTPrompt: async (data) => {
      const prompt = await getPrompt('ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT_PROMPT');
      return replacer(Object.entries(data).map(([key, value]) => replace(`{{${key}}}`, value)))(prompt);
    },
    getSupportConversationOpenPrompt: async () => {
      const prompt = await getPrompt('SUPPORT_CONVERSATION_OPENING_PROMPT');
      return prompt;
    },
  };
})();

export const chatGPTTranslationPromptReplacer = replacer([split('\n\n'), slice(1), join('\n\n'), trim, trim]);

export const translateReplacer = replacer([
  trim,
  (text) => {
    if (text.indexOf('|\n') !== -1) {
      return text.split('|\n')[0];
    }
    return text;
  },
  replace(/\|$/g, ''),
  replace(/^(A|B): /g, ''),
  trim,
  replace(/^“/g, ''),
  replace(/“$/g, ''),
  replace(/^"/g, ''),
  replace(/"$/g, ''),
]);
