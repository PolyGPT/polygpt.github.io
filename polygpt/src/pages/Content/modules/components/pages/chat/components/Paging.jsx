import React, { useCallback, useMemo } from 'react';
import useConversationStore from '../../../store/conversationStore';

const Paging = ({ chat, textAlign }) => {
  const conversation = useConversationStore((store) => store.conversation);
  const setLastConversationNode = useConversationStore((store) => store.setLastConversationNode);

  const parentChat = useMemo(() => {
    if (!chat.parent) {
      return {
        children: [],
      };
    }
    return (
      conversation.mapping[chat.parent] || {
        children: [],
      }
    );
  }, [chat.parent, conversation.mapping]);

  const currentIndex = useMemo(() => {
    return parentChat.children.indexOf(chat.id);
  }, [chat.id, parentChat]);

  const maxLength = useMemo(() => {
    return parentChat.children?.length || 0;
  }, [parentChat]);

  const onClickMove = useCallback(
    (selectIndex) => {
      setLastConversationNode({ selectId: parentChat.children[selectIndex] });
      // const scrollY = window.scrollY;
      // setTimeout(() => {
      //   window.scrollTo(0, scrollY);
      // });

      return false;
    },
    [parentChat.children, setLastConversationNode],
  );

  return (
    parentChat.children.length > 1 && (
      <div className={'fs-6 paging ' + textAlign}>
        <button className={`btn p-0 text-body ${currentIndex === 0 ? 'disabled' : ''}`} onClick={() => onClickMove(currentIndex - 1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
            />
          </svg>
        </button>
        <span>
          {currentIndex + 1} / {parentChat.children?.length}
        </span>
        <button className={`btn p-0 text-body ${currentIndex === maxLength - 1 ? 'disabled' : ''}`} onClick={() => onClickMove(currentIndex + 1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
            />
          </svg>
        </button>
      </div>
    )
  );
};

export default Paging;
