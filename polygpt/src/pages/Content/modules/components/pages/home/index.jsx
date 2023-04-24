import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useConversationStore from '../../store/conversationStore';
import OpenSideMenu from '../components/sidebar/OpenSideMenu';
import { DEFAULT_LANGUAGE } from '../../../../../../codes/Prompt';
import { DEFAULT_CHATGPT_LANGUAGE } from '../../../../../../codes/TransType';
import ModelDropdown from './components/ModelDropdown';
import Footer from './components/Footer';
import { CHATGPT_FREE_PLAN } from '../../../../../../codes/UserPaymentTypes';
import Chat from '../chat';
import { EVENT_RESET_HOME } from '../../../../../../codes/EventType';

const Home = () => {
  const navigate = useNavigate();

  const sendNewMessage = useConversationStore((store) => store.sendNewMessage);
  const isNewChat = useConversationStore((store) => store.isNewChat);
  const redirectConversationId = useConversationStore((store) => store.redirectConversationId);

  const config = useConversationStore((state) => state.config);
  const userPaymentType = useConversationStore((state) => state.userPaymentType);
  const models = useConversationStore((state) => state.models);

  const [language, setLanguage] = useState(config.user_language || DEFAULT_LANGUAGE);
  const [model, setModel] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const onSendMessage = useCallback(
    async ({ message }) => {
      if (isSending === false) {
        await sendNewMessage({
          model: model,
          text: message,
          inputLang: language,
          transLang: DEFAULT_CHATGPT_LANGUAGE,
        });
        setIsSending(true);
      }
    },
    [isSending, language, model, sendNewMessage],
  );

  useEffect(() => {
    if (isSending && redirectConversationId) {
      navigate(`/chat/${redirectConversationId}`);
    }
  }, [isNewChat, isSending, navigate, redirectConversationId]);

  useEffect(() => {
    setLanguage(config.user_language || DEFAULT_LANGUAGE);
  }, [config.user_language]);

  useEffect(() => {
    if (userPaymentType === CHATGPT_FREE_PLAN) {
      if (models.length > 0) {
        setModel(models[0].slug);
      }
    }
  }, [models, setModel, userPaymentType]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data.type === EVENT_RESET_HOME) {
        setIsSending(false);
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  if (!isSending) {
    return (
      <div className="px-3 py-5 text-body bg-body" id="home">
        <OpenSideMenu />
        <div className="row py-4">
          <div className="col text-center">
            <ModelDropdown
              selectModel={(slug) => {
                setModel(slug);
              }}
            />
          </div>
        </div>
        <Footer onSendMessage={onSendMessage} />
      </div>
    );
  } else {
    return <Chat />;
  }
};

export default Home;
// 어떤주재로 ㄹ
