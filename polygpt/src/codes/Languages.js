const Languages = {
  en: 'English',
  af: 'Afrikaans',
  sq: 'Albanian',
  am: 'Amharic',
  ar: 'Arabic',
  hy: 'Armenian',
  az: 'Azerbaijani',
  eu: 'Basque',
  be: 'Belarusian',
  bn: 'Bengali',
  bs: 'Bosnian',
  bg: 'Bulgarian',
  ca: 'Catalan',
  ceb: 'Cebuano',
  ny: 'Chichewa',
  zh: 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  co: 'Corsican',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  eo: 'Esperanto',
  et: 'Estonian',
  tl: 'Filipino',
  fi: 'Finnish',
  fr: 'French',
  fy: 'Frisian',
  gl: 'Galician',
  ka: 'Georgian',
  de: 'German',
  el: 'Greek',
  gu: 'Gujarati',
  ht: 'Haitian Creole',
  ha: 'Hausa',
  haw: 'Hawaiian',
  he: 'Hebrew',
  hi: 'Hindi',
  hmn: 'Hmong',
  hu: 'Hungarian',
  is: 'Icelandic',
  ig: 'Igbo',
  id: 'Indonesian',
  ga: 'Irish',
  it: 'Italian',
  ja: 'Japanese',
  jv: 'Javanese',
  kn: 'Kannada',
  kk: 'Kazakh',
  km: 'Khmer',
  rw: 'Kinyarwanda',
  ko: 'Korean',
  ku: 'Kurdish (Kurmanji)',
  ky: 'Kyrgyz',
  lo: 'Lao',
  la: 'Latin',
  lv: 'Latvian',
  lt: 'Lithuanian',
  lb: 'Luxembourgish',
  mk: 'Macedonian',
  mg: 'Malagasy',
  ms: 'Malay',
  ml: 'Malayalam',
  mt: 'Maltese',
  mi: 'Maori',
  mr: 'Marathi',
  mn: 'Mongolian',
  my: 'Myanmar (Burmese)',
  ne: 'Nepali',
  no: 'Norwegian',
  or: 'Odia (Oriya)',
  ps: 'Pashto',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  pa: 'Punjabi',
  ro: 'Romanian',
  ru: 'Russian',
  sm: 'Samoan',
  gd: 'Scots Gaelic',
  sr: 'Serbian',
  st: 'Sesotho',
  sn: 'Shona',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  es: 'Spanish',
  su: 'Sundanese',
  sw: 'Swahili',
  sv: 'Swedish',
  tg: 'Tajik',
  ta: 'Tamil',
  tt: 'Tatar',
  te: 'Telugu',
  th: 'Thai',
  tr: 'Turkish',
  tk: 'Turkmen',
  uk: 'Ukrainian',
  ur: 'Urdu',
  ug: 'Uyghur',
  uz: 'Uzbek',
  vi: 'Vietnamese',
  cy: 'Welsh',
  xh: 'Xhosa',
  yi: 'Yiddish',
  yo: 'Yoruba',
  zu: 'Zulu',
};

export const getLanguage = (languages, defaultLanguageCode = 'en') => {
  for (let lang of languages) {
    if (lang === 'zh-TW') {
      return {
        code: lang,
        name: Languages[lang],
      };
    }
    const [code] = lang.split('-');
    const normalLang = getLanguageCodeNormalization(code);
    if (Languages[normalLang]) {
      return {
        code: normalLang,
        name: Languages[normalLang],
      };
    }
  }

  return {
    code: getLanguageCodeNormalization(defaultLanguageCode),
    name: Languages[defaultLanguageCode],
  };
};

export const getLanguageName = (languageCode, defaultLanguageName = Languages.en) => {
  return Languages[getLanguageCodeNormalization(languageCode)] || defaultLanguageName;
};

export const hasLanguageCode = (languageCode) => {
  return !!Languages[getLanguageCodeNormalization(languageCode)];
};

export const getLanguageCode = (languageName, defaultLanguageCode = 'en') => {
  const key = Object.keys(Languages).filter((k) => Languages[k] === languageName);
  return getLanguageCodeNormalization(key || defaultLanguageCode);
};

export const getLanguageCodeNormalization = (languageCode) => {
  languageCode = languageCode.toLowerCase();
  if (languageCode === 'jw') {
    return 'jv';
  }

  if (languageCode === 'zh-CN') {
    return 'zh';
  }

  if (languageCode === 'iw') {
    return 'he';
  }

  return languageCode;
};

export default Languages;
