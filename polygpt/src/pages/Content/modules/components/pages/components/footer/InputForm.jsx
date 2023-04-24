import React, { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import useConversationStore from '../../../store/conversationStore';
import { DEFAULT_CHATGPT_LANGUAGE } from '../../../../../../../codes/TransType';
import { showToast } from '../../../utils/utils';

const InputForm = () => {
  const params = useParams();
  const [value, setValue] = useState('');
  const refTimer = useRef(null);
  const sendMessage = useConversationStore((store) => store.sendMessage);
  const conversation = useConversationStore((store) => store.conversation);
  const lastConversationNodeId = useConversationStore((store) => store.lastConversationNodeId);
  const isGeneration = useConversationStore((store) => store.isGeneration);

  const send = useCallback(() => {
    if (!conversation.current_node) {
      showToast('conversation not found');
      return;
    }
    if (refTimer.current === null) {
      refTimer.current = setTimeout(async () => {
        refTimer.current = null;
        if (isGeneration === false) {
          if (value.trim() !== '') {
            const text = value;
            setValue('');
            await sendMessage({
              conversationId: params.conversationId || null,
              parentId: lastConversationNodeId || null,
              text: text,
              transLang: DEFAULT_CHATGPT_LANGUAGE,
            });
            setTimeout(() => {
              window.scrollTo({ top: document.body.scrollHeight });
            });
          }
        }
      }, 100);
    }
  }, [conversation.current_node, isGeneration, lastConversationNodeId, params.conversationId, sendMessage, value]);

  const onKeydown = useCallback(
    (e) => {
      if (e.shiftKey === false) {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          send();
        }
      }
    },
    [send],
  );

  const onClickSend = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      send();
    },
    [send],
  );

  return (
    <div className="vstack gap-2">
      <div className="hstack gap-2 input-form">
        <TextareaAutosize
          className="form-control form-control-dark bg-body"
          minRows={1}
          maxRows={15}
          onKeyDown={onKeydown}
          onChange={(e) => setValue(e.target.value)}
          value={value}></TextareaAutosize>
        <button type="button" className="btn btn-secondary" onClick={onClickSend} disabled={isGeneration}>
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
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InputForm;
