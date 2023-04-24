import React, { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import LeftMenuAction from './LeftMenuAction';
import { removeBracket } from '../../../../../../../utils/replacer';
import useConversationStore from '../../../store/conversationStore';
import { SidebarContext } from '../../../context/SidebarContext';

const LeftMenuItem = ({ item }) => {
  const navigate = useNavigate();
  const { hideSidebar } = useContext(SidebarContext);

  const { conversationId } = useParams();
  const [modify, setModify] = useState(false);
  const [title, setTitle] = useState(item.title || '');
  const refInput = useRef(null);
  const updateConversationTitle = useConversationStore((store) => store.updateConversationTitle);

  const isActive = useMemo(() => {
    return conversationId === item.id;
  }, [conversationId, item.id]);

  const naviClass = useMemo(() => {
    return `nav-link cursor-pointer ${isActive ? 'active' : 'text-white'}`;
  }, [isActive]);

  const onClickConversation = useCallback(
    (e) => {
      e.preventDefault();

      navigate(`/chat/${item.id}`);
      hideSidebar();
      return false;
    },
    [hideSidebar, item.id, navigate],
  );

  const changeModifyMode = useCallback((mode) => {
    setModify(mode);
    return false;
  }, []);

  const onBlueInput = useCallback((e) => {
    e.preventDefault();
    setTimeout(() => {
      setModify(false);
    }, 100);
    return false;
  }, []);

  const onKeyUpInput = useCallback(
    (e) => {
      e.preventDefault();
      if (e.code === 'Enter') {
        updateConversationTitle({ id: conversationId, title });
        setModify(false);
      }
    },
    [conversationId, title, updateConversationTitle],
  );

  useEffect(() => {
    if (modify) {
      if (refInput.current) {
        refInput.current.focus();
      }
    }
  }, [modify]);

  return (
    <li className="nav-item position-relative">
      <div className={naviClass} onClick={onClickConversation}>
        <div className="left-menu-text">
          {modify && (
            <input
              type="text"
              className="form-control title-modify"
              ref={refInput}
              onBlur={onBlueInput}
              onChange={(e) => setTitle(e.target.value)}
              onKeyUp={onKeyUpInput}
              defaultValue={item.title}
            />
          )}
          {!modify && (
            <>
              <div className="title">
                <strong>{removeBracket(item.title)}</strong>
              </div>
              <div className="position-absolute gradient"></div>
            </>
          )}
          <div>
            <small>{dayjs(item.create_time).format('YYYY-MM-DDTHH:mm:ss')}</small>
          </div>
        </div>
      </div>
      {isActive && (
        <LeftMenuAction
          changeModify={changeModifyMode}
          hideConfirmButtons={!modify}
          conversationId={conversationId}
          title={title}
          detaultTitle={item.title}
        />
      )}
    </li>
  );
};

export default LeftMenuItem;
