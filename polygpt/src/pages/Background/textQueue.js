class TextQueue {
  constructor() {
    this.queue = [];
  }
  getCount(tabId) {
    if (this.queue[tabId]) {
      return this.queue[tabId].length;
    } else {
      return 0;
    }
  }

  get getAllCount() {
    return Object.values(this.queue).reduce((prev, curr) => prev + curr, 0);
  }

  push(tabId, port, payload) {
    this.queue.push({ tabId, port, payload });
  }

  pop() {
    return this.queue.splice(0, 1)[0];
  }

  removeQueue(tabId) {
    this.queue = this.queue.filter((v) => v.tabId !== tabId);
  }

  getAllTabId() {
    const result = [];
    for (let v of this.queue) {
      if (v.tabId) {
        result.push(v.tabId);
      }
    }
    return result;
  }
}

const textQueue = new TextQueue();

export default textQueue;
