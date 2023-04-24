import Browser from 'webextension-polyfill';
import { useCallback, useEffect, useMemo, useContext } from 'react';
import * as eventType from '../../../../../../codes/EventType';
import { isDevelopment } from '../../../../../../utils/utils';
import { ScrollDownContext } from '../../context/ScrollDownContext';
import useConversationStore from '../../store/conversationStore';
import { useParams } from 'react-router-dom';

const BackgroundMessage = ({ children }) => {
  const responseChatGTPMesssage = useConversationStore((store) => store.responseChatGTPMesssage);
  const params = useParams();
  const scrollDownContext = useContext(ScrollDownContext);
  const config = useConversationStore((state) => state.config);

  const chatGPTDoing = useCallback(
    (payload) => {
      responseChatGTPMesssage({
        chatGPTMessage: payload,
        transLang: config.user_language,
      });
      if (!scrollDownContext.showDownButton) {
        const { msg } = payload;
        if (params.conversationId && msg.conversation_id && msg.conversation_id === params.conversationId) {
          scrollDownContext.downScroll();
        }
      }
    },
    [config.user_language, params.conversationId, responseChatGTPMesssage, scrollDownContext],
  );

  const EventExecutor = useMemo(() => {
    return {
      [eventType.EVENT_MESSAGE_DOING]: chatGPTDoing,
      [eventType.EVENT_API_EXCEPTION]: (payload) => {
        window.postMessage({ type: eventType.EVENT_API_EXCEPTION, payload }, '*');
      },
    };
  }, [chatGPTDoing]);

  const eventListner = useCallback(
    (request, sender, sendResponse) => {
      if (isDevelopment()) {
        console.log('background - request', request);
      }
      const exec = EventExecutor[request.type];
      if (exec) {
        exec(request.payload);
      }
    },
    [EventExecutor],
  );

  useEffect(() => {
    Browser.runtime.onMessage.addListener(eventListner);
    return () => Browser.runtime.onMessage.removeListener(eventListner);
  }, [eventListner]);

  return null;
};

export default BackgroundMessage;
