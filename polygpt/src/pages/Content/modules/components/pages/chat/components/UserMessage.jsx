import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import useConversationStore from '../../../store/conversationStore';
import {
  TRANS_GOOGLE,
  TRANS_CHAT_GPT,
  DEFAULT_CHATGPT_LANGUAGE,
  TRANS_LANG_OTHER_TYPE,
  TRANS_LANG_ENGLISH_TYPE,
} from '../../../../../../../codes/TransType';
import Paging from './Paging';
import UserIcon from '../../components/Icon/UserIcon';
import MarkdownViewer from './MakdownViewer';
import { splitLineBreak } from '../../../../../../../utils/MarkDownSplitor';
import Loading from './Loading';

const ModifyButton = ({ onModify, isGeneration }) => {
  return (
    <button className="btn btn-sm text-body" onClick={onModify} disabled={isGeneration}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
        <path
          fillRule="evenodd"
          d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
        />
      </svg>
    </button>
  );
};

const ModifyInput = ({ part, onCancel, onSubmit }) => {
  const [inputText, setInputText] = useState(part);

  return (
    <div>
      <TextareaAutosize value={inputText} onChange={(e) => setInputText(e.target.value)} className="form-control text-body text-modify" />
      <div className="text-center">
        <button className="btn btn-success m-3" onClick={() => onSubmit(inputText)}>
          Save & Submit
        </button>
        <button className="btn btn-outline-secondary m-3" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const UserMessageViewer = ({ messageId, messageText, translationText, isWide, isModify, onCancel, onSubmit }) => {
  const isGeneration = useConversationStore((store) => store.isGeneration);
  const lastConversationNodeId = useConversationStore((state) => state.lastConversationNodeId);

  const message = useMemo(() => {
    const splitText = splitLineBreak(messageText);
    const splitTranslation = splitLineBreak(translationText || '');

    return splitText.map((t, index) => [t, (splitTranslation && splitTranslation[index]) || '']);
  }, [messageText, translationText]);

  const isTranslate = useMemo(() => {
    if (isGeneration && lastConversationNodeId === messageId && translationText === '') {
      return true;
    }
    return false;
  }, [isGeneration, lastConversationNodeId, messageId, translationText]);

  const onClickSubmit = useCallback(
    (text) => {
      if (text.trim() !== messageText.trim()) {
        onSubmit(text);
      } else {
        onCancel();
      }
    },
    [messageText, onCancel, onSubmit],
  );

  const onClickCancel = useCallback(
    (e) => {
      e.preventDefault();
      onCancel();
    },
    [onCancel],
  );

  if (isModify) {
    return (
      <div className="row">
        <div className={isWide ? 'position-relative col-6' : 'position-relative col-12'}>
          {!isGeneration && <ModifyInput part={messageText} onCancel={onClickCancel} onSubmit={onClickSubmit} />}
          {isTranslate && <Loading />}
        </div>
        {isWide && <div className="col-6">{!isTranslate && <MarkdownViewer message={translationText} />}</div>}
      </div>
    );
  }

  return message.map(([text, trans], index) => (
    <div className="row" key={`${messageId}_${index}}`}>
      <div className={isWide ? 'position-relative col-6' : 'position-relative col-12'}>
        <MarkdownViewer message={text} />
        {isTranslate && <Loading />}
      </div>
      {isWide && <div className="col-6">{!isTranslate && <MarkdownViewer message={trans} />}</div>}
    </div>
  ));
};

const UserMessage = ({ chat, isWide }) => {
  const params = useParams();
  const [isModify, setIsModify] = useState(false);
  const insertMessage = useConversationStore((store) => store.insertMessage);
  const isGeneration = useConversationStore((store) => store.isGeneration);
  const translation = useConversationStore((store) => store.translation[chat.id]);
  const config = useConversationStore((state) => state.config);

  const parts = useMemo(() => {
    if (chat && chat.message && chat.message.content) {
      return chat.message.content.parts || [];
    }
    return [];
  }, [chat]);

  const getUserInputText = useCallback(
    (part) => {
      if (translation && translation[0]) {
        if (translation[0][TRANS_CHAT_GPT]) {
          return translation ? translation[0][TRANS_CHAT_GPT][TRANS_LANG_OTHER_TYPE] : part;
        }
        if (translation[0][TRANS_GOOGLE]) {
          return translation ? translation[0][TRANS_GOOGLE][TRANS_LANG_OTHER_TYPE] : part;
        }
      }

      return part;
    },
    [translation],
  );

  const translationText = useMemo(() => {
    if (translation && translation[0]) {
      if (translation[0][TRANS_CHAT_GPT] && translation[0][TRANS_CHAT_GPT][TRANS_LANG_ENGLISH_TYPE]) {
        return translation[0][TRANS_CHAT_GPT][TRANS_LANG_ENGLISH_TYPE];
      }
      if (translation[0][TRANS_GOOGLE] && translation[0][TRANS_GOOGLE][TRANS_LANG_ENGLISH_TYPE]) {
        return translation[0][TRANS_GOOGLE][TRANS_LANG_ENGLISH_TYPE];
      }
    }
    return '';
  }, [translation]);

  const onClickModify = useCallback((e) => {
    e.preventDefault();

    setIsModify(true);
  }, []);

  const onClickSubmit = useCallback(
    (text) => {
      insertMessage({
        conversationId: params.conversationId,
        parentId: chat.parent,
        text: text,
        transLang: DEFAULT_CHATGPT_LANGUAGE,
        inputLang: config.user_language,
      });
    },
    [chat, config.user_language, insertMessage, params.conversationId],
  );

  const onClickCancel = useCallback(() => {
    setIsModify(false);
  }, []);

  return parts.map((part, index) => (
    <div className="row node user" key={`${chat.id}_${index}`}>
      <div className={isWide ? 'col-12 px-4' : 'col-12 px-4'}>
        <div className="row">
          <div className="col-12 ps-5 position-relative">
            <div className="position-absolute profile-image">
              <UserIcon />
            </div>
            <UserMessageViewer
              messageId={chat.id}
              messageText={getUserInputText(part)}
              translationText={translationText}
              isModify={isModify}
              isWide={isWide}
              onCancel={onClickCancel}
              onSubmit={onClickSubmit}
            />
            <div className="position-absolute" style={{ right: '0rem', top: '0px' }}>
              {!isModify && <ModifyButton onModify={onClickModify} isGeneration={isGeneration} />}
            </div>
          </div>
          <div className="row node-footer">
            <div className="col">
              <Paging chat={chat} textAlign={'text-center'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ));
};

export default UserMessage;
