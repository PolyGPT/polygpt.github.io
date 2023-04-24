import * as eventType from '../../../../../../codes/EventType';
import BackgroundCaller from './BackgroundCaller';

const promptServices = {
  getPrompt(key = undefined) {
    return BackgroundCaller(eventType.EVENT_GET_PROMPT, { key });
  },
  setPrompt(prompt) {
    return BackgroundCaller(eventType.EVENT_SET_PROMPT, { prompt });
  },
};

export default promptServices;
