import * as roleType from '../codes/RoleType';

const splitChar = '\n\n';

const createTransData = (chatData, text, paragraph_seq) => {
  const needTrans = !(text.substring(0, 3) === '```' || text.substring(0, 1) === '|');

  return {
    ...chatData,
    paragraph_seq: paragraph_seq,
    text: needTrans ? replaceAlphabetNumber(text) : text,
    needTrans: needTrans,
  };
};

export const splitLineBreak = (text) => {
  if (text.indexOf('```') === -1) {
    return text.split(splitChar).filter((t) => t.trim() !== '');
  }

  const splitText = text.split(splitChar);
  let isMergeText = false;
  let mergeText = [];
  let retText = [];
  for (const t of splitText) {
    if (t.substring(0, 3) === '```') {
      isMergeText = true;
    }
    if (isMergeText) {
      mergeText.push(t);
      if (t.substring(t.length - 3) === '```') {
        retText.push(mergeText.join(splitChar));
        mergeText = [];
        isMergeText = false;
      }
    } else {
      retText.push(t);
    }
  }
  // stop generate 일경우 발생할수 있음
  if (mergeText.length > 0) {
    retText.push(mergeText.join(splitChar));
  }

  return retText.filter((t) => t.trim() !== '');
};

export const joinLineBreak = (splitText) => {
  return splitText.join(splitChar);
};

export const replaceAlphabetNumber = (text) => {
  return text.replace(/^([a-zA-Z]\.)/g, '0$1');
};

export const restoreAlphabetNumber = (text) => {
  return text.replace(/^(0)([a-zA-Z]\.)/g, '$2');
};

export const restoreMarkup = (text) => {
  return restoreAlphabetNumber(text);
};

export const splitMarkup = (chatData) => {
  const convertTransData = () => {
    let splitedLines = [];
    if (chatData.role === roleType.ROLE_USER_TYPE) {
      splitedLines = [chatData.input_text];
    } else {
      splitedLines = splitLineBreak(chatData.input_text);
    }
    return splitedLines.map((text, index) => createTransData(chatData, text, index));
  };

  return convertTransData();
};
