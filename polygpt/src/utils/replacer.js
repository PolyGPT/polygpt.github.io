export const split = (splitText) => (v) => {
  return v.split(splitText);
};

export const slice =
  (start = 0, end = undefined) =>
  (v) => {
    return v.slice(start, end);
  };

export const join = (joinText) => (v) => {
  return v.join(joinText);
};

export const trim = (v) => {
  return v.trim();
};

export const replace = (target, result) => (v) => {
  return v.replace(target, result);
};

export const removeBracket = (text) => {
  if (text) {
    return replace(/\([^)]*\)/, '')(text).trim();
  } else {
    return '';
  }
};
