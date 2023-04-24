import Browser from 'webextension-polyfill';
import { EVENT_API_EXCEPTION } from '../../../../../../codes/EventType';
import { APIError } from '../../../../../../utils/exception';
import { isDevelopment, uuidv4 } from '../../../../../../utils/utils';

const BackgroundCaller = async (types, payload) => {
  const response = await Browser.runtime.sendMessage({ type: types, id: uuidv4(), payload });
  if (isDevelopment()) {
    console.log(types, response);
  }
  if (response && response.error) {
    window.postMessage({
      type: EVENT_API_EXCEPTION,
      payload: {
        status: response.status,
        message: response.error,
      },
    });
    throw new APIError(response.error, response.status);
  }
  return response;
};

export default BackgroundCaller;
