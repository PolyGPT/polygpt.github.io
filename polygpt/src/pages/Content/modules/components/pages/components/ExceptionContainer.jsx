import Browser from 'webextension-polyfill';
import React, { useCallback, useEffect, useState } from 'react';
import { OPEN_AI_URL } from '../../../../../../codes/ChatGPT';
import { EVENT_API_EXCEPTION, EVENT_LOGIN_CHAT_GPT } from '../../../../../../codes/EventType';
import useConversationStore from '../../store/conversationStore';

const ExceptionContainer = ({ children }) => {
  const getUserSession = useConversationStore((state) => state.getUserSession);
  const init = useConversationStore((state) => state.init);
  const [exception, setException] = useState(null);

  const onClick = useCallback(async () => {
    window.open(OPEN_AI_URL);
  }, []);

  const onBackendMessage = useCallback(
    async (e) => {
      if (exception !== null) {
        if (e.type === EVENT_LOGIN_CHAT_GPT) {
          await getUserSession();
          await init();
          setException(null);
        }
      }
    },
    [exception, getUserSession, init],
  );

  useEffect(() => {
    const onMessage = (e) => {
      const { payload } = e.data;
      if (e.data.type === EVENT_API_EXCEPTION && payload && payload.status && payload.status === 403) {
        setException(e.payload);
      }
    };
    window.addEventListener('message', onMessage, false);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  useEffect(() => {
    Browser.runtime.onMessage.addListener(onBackendMessage);
    return () => {
      Browser.runtime.onMessage.removeListener(onBackendMessage);
    };
  }, [onBackendMessage]);

  if (exception === null) {
    return children;
  } else {
    return (
      <div className="d-flex text-center text-bg-dark" style={{ height: '100vh' }}>
        <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
          <div className="mb-auto">&nbsp;</div>
          <main className="px-3">
            {/* <h1>Error</h1>
            <p className="lead">ChatGPT Error</p> */}
            <p className="lead">
              <button className="btn btn-lg btn-success mx-2" onClick={onClick}>
                ChatGPT login
              </button>
            </p>
          </main>

          <footer className="mt-auto text-white-50">
            <p>PolyGPT</p>
          </footer>
        </div>
      </div>
    );
  }
};

export default ExceptionContainer;
