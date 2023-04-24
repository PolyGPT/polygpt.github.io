import { sleep } from '../../utils/utils';

class ChatGPTQueue {
  /*
  queue: Array<{timestamp: number; score: number; chatData: chatData; callBack: Callable}>
  */
  constructor() {
    this.queue = [];
  }

  get count() {
    return this.queue.length;
  }

  clear(score) {
    const clearList = this.queue.filter((v) => v.score === score);
    this.queue = this.queue.filter((v) => v.score !== score);
    clearList.forEach((data) => data.callbackAction(null));
  }

  push(data, score, cacheOnly = true, callbackAction, errorCallbackAction) {
    if (!errorCallbackAction || !callbackAction) {
      throw new Error('errorCallbackAction or callbackAction is null');
    }
    this.queue.push({
      timestamp: Date.now(),
      score,
      cacheOnly,
      data,
      callbackAction,
      errorCallbackAction,
    });
  }

  // score 제일 높은거 추출
  pop() {
    return this.queue.sort((a, b) => b.score - a.score || b.status - a.status || a.timestamp - b.timestamp).splice(0, 1)[0];
  }

  async run() {
    while (true) {
      await sleep(100);
      if (this.count === 0) {
        continue;
      }
      const data = this.pop();
      try {
        await data.callbackAction(data);
      } catch (e) {
        data.errorCallbackAction && data.errorCallbackAction(e);
      }
    }
  }
}

const chatGPTQueue = new ChatGPTQueue();

if (process.env.NODE_ENV !== 'test') {
  chatGPTQueue.run();
}

export { chatGPTQueue };
