import Browser from 'webextension-polyfill';

export const sendBackgroundMessage = (type, payload, port) => {
  if (isDevelopment()) {
    console.log('sendBackgroundMessage', type, payload);
  }
  if (port) {
    port.postMessage({ type, payload });
  } else {
    Browser.runtime.sendMessage({
      type,
      payload,
    });
  }
};

export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
  // return false
};

const expKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
export const isEnglish = (str) => {
  if (expKorean.test(str)) {
    return false;
  }
  return true;
};

export const uuidv4 = () => {
  // eslint-disable-next-line no-mixed-operators
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );
};

export const sleep = (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

function gaussianRandom(mean, standardDeviation) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // 0부터 1사이의 난수 생성
  while (v === 0) v = Math.random();
  let x = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  x = x * standardDeviation + mean;
  return Math.min(1, Math.max(0, x)); // 0부터 1사이의 값을 반환하도록 범위 제한
}

export const randomSleep = async (minDuration) => {
  const randomV = gaussianRandom(0.5, 0.1);
  await sleep(minDuration + minDuration * randomV);
};

export const replacer = (funcs) => (text) => {
  let result = text;
  for (let func of funcs) {
    result = func(result);
  }
  return result;
};

export const executeTime = async (title, fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${title} Execution time: ${end - start} ms`);
  return result;
};
