import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useConversationStore from '../../../store/conversationStore';

const SHOW_ACTION_UPDATE = 'update';
const SHOW_ACTION_DELETE = 'delete';

const LeftMenuAction = ({ changeModify, hideConfirmButtons, conversationId, title, detaultTitle }) => {
  const navigate = useNavigate();
  const [showConfirmButton, setConfirmButton] = useState('');

  const deleteConversation = useConversationStore((store) => store.deleteConversation);
  const updateConversationTitle = useConversationStore((store) => store.updateConversationTitle);

  const onClickModify = useCallback(
    (e) => {
      e.preventDefault();

      changeModify(true);
      setConfirmButton(SHOW_ACTION_UPDATE);

      return false;
    },
    [changeModify],
  );

  const onClickDelete = useCallback((e) => {
    e.preventDefault();

    setConfirmButton(SHOW_ACTION_DELETE);

    return false;
  }, []);

  const onClickReturn = useCallback((e) => {
    e.preventDefault();

    return false;
  }, []);

  const onClickConfirm = useCallback(
    (e) => {
      e.preventDefault();

      if (showConfirmButton === SHOW_ACTION_UPDATE) {
        changeModify(false);
        if (detaultTitle.trim() !== title.trim()) {
          updateConversationTitle({ id: conversationId, title });
        }
      } else if (showConfirmButton === SHOW_ACTION_DELETE) {
        deleteConversation({ id: conversationId });
        navigate('/');
      }
      setConfirmButton('');

      return false;
    },
    [changeModify, conversationId, deleteConversation, detaultTitle, navigate, showConfirmButton, title, updateConversationTitle],
  );

  const onClickCancel = useCallback(
    (e) => {
      e.preventDefault();

      if (showConfirmButton === SHOW_ACTION_UPDATE) {
        changeModify(false);
      }
      setConfirmButton('');
    },
    [changeModify, showConfirmButton],
  );

  useEffect(() => {
    if (hideConfirmButtons === true) {
      setConfirmButton('');
    }
  }, [hideConfirmButtons]);

  if (showConfirmButton === '') {
    return (
      <div className="btn-group position-absolute menu-button" role="group">
        <button className="btn btn-sm" onMouseDown={onClickModify} onClick={onClickReturn}>
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button className="btn btn-sm" onMouseDown={onClickDelete} onClick={onClickReturn}>
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    );
  } else {
    return (
      <div className="btn-group position-absolute menu-button" role="group">
        <button className="btn btn-sm" onMouseDown={onClickConfirm} onClick={onClickReturn}>
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
        <button className="btn btn-sm" onMouseDown={onClickCancel} onClick={onClickReturn}>
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    );
  }
};

export default LeftMenuAction;
