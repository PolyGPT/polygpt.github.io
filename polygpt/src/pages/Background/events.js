import Browser from 'webextension-polyfill';
import EventExecutor from './events/index';
import { OPEN_AI_URL } from '../../codes/ChatGPT';
import { TEST_SITE, POLY_SITE } from '../../codes/Common';

const setAlarmEvent = () => {
  // const CLEAN_QUEUE_ALARM_NAME = 'cleanQueue';
  // const CLEAN_LOCAL_STORAGE_NAME = 'cleanLocalStorage';
  const CHAT_GPT_PAGE_RELOAD = 'CHAT_GPT_PAGE_RELOAD';

  // Browser.alarms.create(CLEAN_QUEUE_ALARM_NAME, {
  //   when: Date.now() + 1000 * 60,
  //   periodInMinutes: 1,
  // });
  // Browser.alarms.create(CLEAN_LOCAL_STORAGE_NAME, {
  //   when: Date.now() + 1000 * 60,
  //   periodInMinutes: 1 * 60,
  // });

  Browser.alarms.create(CHAT_GPT_PAGE_RELOAD, {
    when: Date.now() + 1000 * 30,
    periodInMinutes: 30,
  });

  Browser.alarms.onAlarm.addListener(async (e) => {
    if (e.name === CHAT_GPT_PAGE_RELOAD) {
      const currentChromeTab = await Browser.tabs.query({ active: true, lastFocusedWindow: true });
      if (currentChromeTab.length > 0) {
        const currentUrl = currentChromeTab[0].url;
        if (currentUrl.indexOf(OPEN_AI_URL) !== -1) return;
      }

      const testTabs = await Browser.tabs.query({ url: `${TEST_SITE}/*` });
      const polyTabs = await Browser.tabs.query({ url: `${POLY_SITE}/*` });
      if (testTabs.length === 0 && polyTabs.length === 0) return;

      const tabs = await Browser.tabs.query({ url: `${OPEN_AI_URL}/c/*` });
      if (tabs.length > 0) {
        await Browser.tabs.reload(tabs[0].id);
      }
    }
    // if (e.name === CLEAN_LOCAL_STORAGE_NAME) {
    //   if (isDevelopment()) {
    //     console.log('CLEAN LOCAL STORAGE');
    //   }
    //   LocalStorageAPI.expire().then((expiredKeys) => {
    //     console.log('CLEANED LOCAL STORAGE KEYS', expiredKeys);
    //   });
    // }
  });
};

const setMessageEvent = () => {
  Browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async (request, sender, sendResponse) => {
      try {
        const exec = EventExecutor[request.type];
        if (exec) {
          const response = await exec(request, sender);
          sendResponse(response);
        } else {
          sendResponse({
            error: new Error(`${request.type} not found`),
          });
        }
      } catch (e) {
        console.error('Error', e);
        sendResponse({
          error: e.message,
          status: e.status,
          value: e.value,
        });
      }
    })(request, sender, sendResponse);
    return true;
  });
};

const setEvents = () => {
  setAlarmEvent();
  setMessageEvent();

  Browser.action.onClicked.addListener(() => {
    Browser.tabs.create({ url: POLY_SITE });
  });
};

export default setEvents;
