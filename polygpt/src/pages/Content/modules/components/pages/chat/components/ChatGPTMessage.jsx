import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Paging from './Paging';
import Like from './Like';
import useConversationStore from '../../../store/conversationStore';
import {
  TRANS_ENGLISH,
  TRANS_GOOGLE,
  TRANS_CHAT_GPT,
  TRANS_LANG_OTHER_TYPE,
  TRANS_LANG_ENGLISH_TYPE,
  TRANS_DETECT_LANGUAGE,
  TRANS_DEEPL,
} from '../../../../../../../codes/TransType';
import { splitLineBreak } from '../../../../../../../utils/MarkDownSplitor';
import GPTIcon from '../../components/Icon/GPTIcon';
import Loading from './Loading';
import GoogleIcon from '../../components/Icon/GoogleIcon';
import MarkdownViewer from './MakdownViewer';
import DeeplIcon from '../../components/Icon/DeeplIcon';
import TextareaAutosize from 'react-textarea-autosize';
import EnIcon from '../../components/Icon/EnIcon';
import TranslationServices from '../../../store/services/TranslationServices';
import { DEEPL_EXTENSION_SITE, DEEPL_SEARCH_NAME } from '../../../../../../../codes/Common';
import { sleep } from '../../../../../../../utils/utils';

function TranslationViewer({ chat, isWide, priorityTranslation }) {
  const translation = useConversationStore((store) => store.translation[chat.id]);
  const processTranslation = useConversationStore((store) => store.processTranslation[chat.id]);

  const part = useMemo(() => {
    if (chat && chat.message && chat.message.content) {
      return chat.message.content.parts[0] || [];
    }
    return [];
  }, [chat]);

  const splitText = useMemo(() => {
    return splitLineBreak(part);
  }, [part]);

  const languageType = useCallback(
    (seq) => {
      if (translation && translation[seq]) {
        for (let transType of priorityTranslation) {
          if (translation[seq][transType]) {
            return transType;
          }
        }
      }
      return null;
    },
    [priorityTranslation, translation],
  );

  const paragraphSeqNo = useMemo(() => {
    if (splitText) {
      return splitText.map((i, index) => index);
    }
    return [];
  }, [splitText]);

  const getMessage = useCallback(
    (seq, type) => {
      const langType = languageType(seq);
      if (!isWide && langType === TRANS_DETECT_LANGUAGE) {
        return splitText[seq];
      }

      if (translation[seq] && translation[seq][langType]) {
        if (translation[seq][langType][type]) {
          if (langType === TRANS_ENGLISH) {
            return translation[seq][langType][TRANS_LANG_ENGLISH_TYPE];
          }
          return translation[seq][langType][type];
        }
        return null;
      } else {
        if (type === TRANS_LANG_OTHER_TYPE) {
          return splitText[seq];
        }
      }

      return '';
    },
    [isWide, languageType, splitText, translation],
  );

  const isLoading = useCallback(
    (seq, type) => {
      if (processTranslation) {
        if (processTranslation[seq]) {
          return processTranslation[seq];
        }
      }
      return false;
    },
    [processTranslation],
  );

  return paragraphSeqNo.map((seqNo) => {
    return (
      <div className={'row ' + languageType(seqNo)} key={`${chat.id}_${seqNo}`}>
        <div className={isWide ? 'position-relative col-6' : ' position-relative col-12'}>
          <MarkdownViewer message={getMessage(seqNo, TRANS_LANG_OTHER_TYPE)}></MarkdownViewer>
          {isLoading(seqNo) && <Loading />}
        </div>
        {isWide && (
          <div className="position-relative col-6">
            <MarkdownViewer message={getMessage(seqNo, TRANS_LANG_ENGLISH_TYPE)}></MarkdownViewer>
          </div>
        )}
      </div>
    );
  });
}

function ChatGPTViewer({ chat, isWide }) {
  const generateMessageId = useConversationStore((store) => store.generateMessageId);
  const part = useMemo(() => {
    if (chat && chat.message && chat.message.content) {
      return chat.message.content.parts[0] || '';
    }
    return '';
  }, [chat]);

  return (
    <div className="row">
      <div className={isWide ? 'col-6' : 'col-12'}>
        <MarkdownViewer message={part} messageId={chat.message.id} generateMessageId={generateMessageId} />
      </div>
      {isWide && <div className="col-6"></div>}
    </div>
  );
}

function DeeplInput({ chat, isWide }) {
  const ref = useRef(null);

  const params = useParams();
  const sendDeeplTranslation = useConversationStore((store) => store.sendDeeplTranslation);
  const part = useMemo(() => {
    if (chat && chat.message && chat.message.content) {
      return chat.message.content.parts[0] || '';
    }
    return '';
  }, [chat]);

  const [value, setValue] = useState(part);

  const onBlurDeepl = useCallback(
    (e) => {
      sendDeeplTranslation(params.conversationId, chat.message, e.target.value);
    },
    [chat.message, params.conversationId, sendDeeplTranslation],
  );

  const onFocusTextarea = useCallback(async () => {
    // if (ref !== null) {
    //   await sleep(100);
    //   const shadowInlineRoot = ref.current.parentNode.querySelector('deepl-inline-translate').shadowRoot;
    //   if (shadowInlineRoot.querySelector('div.icon-container')) {
    //     shadowInlineRoot.querySelector('div.icon-container').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    //   } else {
    //     return null;
    //   }
    //   await sleep(100);
    //   document.querySelector('h');
    //   const inlinePopup = document.querySelectorAll('deepl-inline-popup');
    //   let isClick = false;
    //   console.log('inlinePopup', inlinePopup);
    //   for (let index = 0; index < inlinePopup.length; index++) {
    //     const shadowRoot = inlinePopup[index].shadowRoot;
    //     console.log('shadowRoot', shadowRoot);
    //     const container = shadowRoot.querySelector('div.container div.icon-container');
    //     console.log('container', container);
    //     if (container) {
    //       console.log('container.querySelector("div[data-tooltip=Settings]")', container.querySelector("div[data-tooltip='Settings']"));
    //       container.querySelector("div[data-tooltip='Settings']").dispatchEvent(new MouseEvent('click', { bubbles: true }));
    //       isClick = true;
    //     }
    //   }
    //   if (!isClick) {
    //     return null;
    //   }
    // }
  }, []);

  useEffect(() => {
    if (ref !== null) {
      ref.current.focus();
    }
  }, [ref]);

  return (
    <div className="row">
      <div className={isWide ? 'col-6' : 'col-12'}>
        <TextareaAutosize
          className="form-control form-control-dark"
          minRows={5}
          onChange={(e) => setValue(e.target.value)}
          value={value}
          ref={ref}
          onFocus={onFocusTextarea}
          onBlur={onBlurDeepl}></TextareaAutosize>
      </div>
      {isWide && (
        <div className="col-6">
          <MarkdownViewer message={part}></MarkdownViewer>
        </div>
      )}
    </div>
  );
}

function Viewer({ chat, isWide, priorityTranslation, activeTranslation }) {
  const translation = useConversationStore((store) => store.translation[chat.id]);

  if (activeTranslation === TRANS_DEEPL) {
    if (!translation || !translation[0] || !translation[0][TRANS_DEEPL]) {
      return <DeeplInput chat={chat} isWide={isWide} />;
    }
  }

  if (translation) {
    return <TranslationViewer chat={chat} isWide={isWide} priorityTranslation={priorityTranslation} />;
  }

  return <ChatGPTViewer chat={chat} isWide={isWide} />;
}

const TranslationButton = ({ chat, isWide, changeOrdering, activeTranslation, setActiveTranslation }) => {
  const params = useParams();
  const translation = useConversationStore((store) => store.translation[chat.id]);
  const [isChange, setIsChange] = useState(false);
  const [selectTransTypeWithoutEnglish, setSelectTransTypeWithoutEnglish] = useState(null);
  const [selectedEnlish, setSelectedEnglish] = useState(false);
  const generateMessageId = useConversationStore((store) => store.generateMessageId);

  const sendGoogleTranslation = useConversationStore((store) => store.sendGoogleTranslation);
  const sendChatGPTTranslation = useConversationStore((store) => store.sendChatGPTTranslation);

  const hasTranslationType = useCallback(
    (type) => {
      if (translation && translation[0] && translation[0][type]) {
        return true;
      }
      return false;
    },
    [translation],
  );

  const changeTranslationType = useCallback(
    (transType) => {
      const ordering = [transType];
      const addOrdering = (orders) => {
        orders.forEach((item) => {
          if (hasTranslationType(item)) {
            ordering.push(item);
          }
        });
      };
      if (transType === TRANS_ENGLISH) {
        addOrdering([TRANS_ENGLISH, TRANS_GOOGLE, TRANS_CHAT_GPT, TRANS_DEEPL]);
        setSelectedEnglish(true);
      } else if (transType === TRANS_GOOGLE) {
        addOrdering([TRANS_CHAT_GPT, TRANS_DEEPL, TRANS_ENGLISH]);
        sendGoogleTranslation(params.conversationId, chat.message);
        setSelectTransTypeWithoutEnglish(transType);
      } else if (transType === TRANS_CHAT_GPT) {
        addOrdering([TRANS_DEEPL, TRANS_GOOGLE, TRANS_ENGLISH]);
        sendChatGPTTranslation(params.conversationId, chat.message);
        setSelectTransTypeWithoutEnglish(transType);
      } else if (transType === TRANS_DEEPL) {
        addOrdering([TRANS_CHAT_GPT, TRANS_GOOGLE, TRANS_ENGLISH]);
        setSelectTransTypeWithoutEnglish(transType);
      }

      ordering.push(TRANS_DETECT_LANGUAGE);
      changeOrdering(ordering);
      setActiveTranslation(transType);
      setIsChange(true);
    },
    [changeOrdering, chat.message, hasTranslationType, params.conversationId, sendChatGPTTranslation, sendGoogleTranslation, setActiveTranslation],
  );

  const onClickTranslationType = useCallback(
    async (transType) => {
      if (generateMessageId !== null) {
        return null;
      }
      if (transType === TRANS_DEEPL) {
        const extensions = await TranslationServices.searchExtension({ name: DEEPL_SEARCH_NAME });
        if (extensions.length === 0) {
          window.open(DEEPL_EXTENSION_SITE, '_blank');
          return;
        }
      }
      if (!isWide) {
        setSelectedEnglish(false);
      }
      changeTranslationType(transType);
    },
    [changeTranslationType, generateMessageId, isWide],
  );

  useEffect(() => {
    if (isChange === false) {
      if (translation && translation[0] && translation[0][TRANS_CHAT_GPT]) {
        setActiveTranslation(TRANS_CHAT_GPT);
        setSelectTransTypeWithoutEnglish(TRANS_CHAT_GPT);
      } else if (translation && translation[0] && translation[0][TRANS_DEEPL]) {
        setActiveTranslation(TRANS_DEEPL);
        setSelectTransTypeWithoutEnglish(TRANS_DEEPL);
      } else if (translation && translation[0] && translation[0][TRANS_GOOGLE]) {
        setActiveTranslation(TRANS_GOOGLE);
        setSelectTransTypeWithoutEnglish(TRANS_GOOGLE);
      }
    }
  }, [isChange, setActiveTranslation, translation]);

  useEffect(() => {
    if (!isWide && selectedEnlish && TRANS_ENGLISH !== activeTranslation) {
      changeTranslationType(TRANS_ENGLISH);
    } else if (isWide && TRANS_ENGLISH === activeTranslation) {
      changeTranslationType(selectTransTypeWithoutEnglish);
    }
  }, [activeTranslation, isWide, changeTranslationType, selectTransTypeWithoutEnglish, selectedEnlish]);

  // if (generateMessageId === chat.id) {
  //   return null;
  // }

  // if (generateMessageId !== null) {
  //   return null;
  // }

  return (
    <div className="mt-3">
      {!isWide && (
        <div className="mt-1 me-4 translation">
          <button
            className={'btn p-0' + (activeTranslation === TRANS_ENGLISH ? ' active' : '')}
            onClick={() => onClickTranslationType(TRANS_ENGLISH)}
            disabled={generateMessageId !== null}>
            <EnIcon width={18} height={18} />
          </button>
        </div>
      )}
      <div className="mt-1 me-4 translation">
        <button
          className={'btn p-0' + (activeTranslation === TRANS_GOOGLE ? ' active' : '')}
          onClick={() => onClickTranslationType(TRANS_GOOGLE)}
          disabled={generateMessageId !== null}>
          <GoogleIcon width={18} height={18} />
        </button>
      </div>
      <div className="mt-1 me-4 translation">
        <button
          className={'btn p-0' + (activeTranslation === TRANS_DEEPL ? ' active' : '')}
          onClick={() => onClickTranslationType(TRANS_DEEPL)}
          disabled={generateMessageId !== null}>
          <DeeplIcon width={18} height={18} />
        </button>
      </div>
      <div className="mt-1 me-4 translation">
        <button
          className={'btn p-0' + (activeTranslation === TRANS_CHAT_GPT ? ' active' : '')}
          onClick={() => onClickTranslationType(TRANS_CHAT_GPT)}
          disabled={generateMessageId !== null}>
          <GPTIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
};

function ChatGPTMessage({ chat, isWide }) {
  const params = useParams();

  const [activeTranslation, setActiveTranslation] = useState(null);
  const [priorityTranslation, setPriorityTranslation] = useState([TRANS_CHAT_GPT, TRANS_DEEPL, TRANS_GOOGLE, TRANS_ENGLISH]);

  return (
    <div className="row node assistant" key={`${chat.id}`}>
      <div className={isWide ? 'col-12 px-4' : 'col-12 px-4'}>
        <div className="row">
          <div className="col-12 px-5 position-relative">
            <div className="position-absolute profile-image">
              <GPTIcon width={32} height={32} />
              <TranslationButton
                isWide={isWide}
                chat={chat}
                changeOrdering={(order) => setPriorityTranslation(order)}
                activeTranslation={activeTranslation}
                setActiveTranslation={setActiveTranslation}
              />
            </div>
            <Viewer isWide={isWide} chat={chat} priorityTranslation={priorityTranslation} activeTranslation={activeTranslation} />
            <div className="position-absolute" style={{ right: '0rem', top: '0px' }}>
              <Like conversationId={params.conversationId} messageId={chat.id} chat={chat} />
            </div>
          </div>
        </div>
        <div className="row node-footer">
          <div className="col-2  text-center"></div>
          <div className="col  text-center">
            <Paging chat={chat} textAlign={'text-center'} />
          </div>
          <div className="col-2  text-center"></div>
        </div>
      </div>
    </div>
  );
}

export default ChatGPTMessage;
