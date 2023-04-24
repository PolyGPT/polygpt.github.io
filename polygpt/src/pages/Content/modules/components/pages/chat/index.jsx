import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import ChatRole from './components/ChatRole';
import useConversationStore from '../../store/conversationStore';
import { ROLE_ASSISTANT_TYPE, ROLE_USER_TYPE } from '../../../../../../codes/RoleType';
import { WIDE_SIZE } from '../../codes/Size';
import Header from './components/Header';
import { SpinnerContext } from '../../context/SpinnerContext';

const Chat = () => {
  const params = useParams();
  const navigator = useNavigate();
  const { showSpinner, hideSpinner } = useContext(SpinnerContext);
  const getConversation = useConversationStore((store) => store.getConversation);
  const conversation = useConversationStore((store) => store.conversation);
  const userSession = useConversationStore((store) => store.userSession);
  const lastConversationNodeId = useConversationStore((store) => store.lastConversationNodeId);
  const [isWide, setIsWide] = useState(false);

  const mapping = useMemo(() => {
    const { mapping } = conversation;
    return mapping || {};
  }, [conversation]);

  const mappingKeys = useMemo(() => {
    const { mapping } = conversation;
    const getNodeKeys = (nodeKey) => {
      if (!nodeKey || !mapping || !mapping[nodeKey] || !mapping[nodeKey].message) {
        return [];
      }
      if (mapping[nodeKey].message.author.role === ROLE_USER_TYPE || mapping[nodeKey].message.author.role === ROLE_ASSISTANT_TYPE) {
        if (nodeKey === mapping[nodeKey].parent) {
          return [];
        }
        return [nodeKey, ...getNodeKeys(mapping[nodeKey].parent)];
      } else {
        return [];
      }
    };

    const keys = getNodeKeys(lastConversationNodeId).reverse();

    return keys;
  }, [conversation, lastConversationNodeId]);

  const loadConversation = useCallback(
    async (id) => {
      if (params.conversationId) {
        showSpinner();
        try {
          await getConversation({ id: params.conversationId });
        } catch (e) {
          hideSpinner();
          navigator('/');
          return;
        }
        hideSpinner();
        setTimeout(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
      }
    },
    [getConversation, hideSpinner, navigator, params.conversationId, showSpinner],
  );

  useEffect(() => {
    if (userSession.accessToken) {
      loadConversation();
    }
  }, [params.conversationId, getConversation, userSession, loadConversation]);

  useEffect(() => {
    const onWindowResize = (e) => {
      setIsWide(window.innerWidth > WIDE_SIZE);
    };
    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);

    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return (
    <div className="px-3 rounded shadow-sm text-body bg-body">
      <Header />
      {mappingKeys.map((key, index) => (
        <ChatRole key={key} chat={mapping[key]} isWide={isWide} />
      ))}
      <div className="content-bottom"></div>
      <Footer />
    </div>
  );
};

export default Chat;
