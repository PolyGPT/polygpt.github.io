import React, { useCallback, useMemo } from 'react';
import OpenSideMenu from '../../components/sidebar/OpenSideMenu';
import useConversationStore from '../../../store/conversationStore';
import { removeBracket } from '../../../../../../../utils/replacer';
import { useNavigate } from 'react-router-dom';
import { EVENT_RESET_HOME } from '../../../../../../../codes/EventType';
const Header = () => {
  const navigate = useNavigate();
  const conversation = useConversationStore((store) => store.conversation);
  const model = useConversationStore((store) => store.model);
  const modelTitle = useConversationStore((store) => store.modelTitle);

  const goHome = useCallback(() => {
    window.postMessage({ type: EVENT_RESET_HOME }, '*');
    navigate('/');
  }, [navigate]);

  if (!conversation.title) {
    return '';
  }

  return (
    <div className="text-body bg-body mt-6">
      <div className="title text-body bg-body">
        <OpenSideMenu />
        <h5 className="mb-0 text-center text-truncate text-break">
          {model !== '' && <small>[ {removeBracket(modelTitle)} ]</small>} <span className="--bs-light-text">{conversation.title || ''}</span>
        </h5>
        <div className="btn-new-chat">
          <button className="btn text-body" onClick={goHome}>
            <span>
              [
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              ]
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
