import * as eventType from '../../../../../../codes/EventType';
import BackgroundCaller from './BackgroundCaller';

const configService = {
  getConfig() {
    return BackgroundCaller(eventType.EVENT_GET_CONFIG, {});
  },

  setConfig({ data }) {
    return BackgroundCaller(eventType.EVENT_SET_CONFIG, data);
  },
};

export default configService;
