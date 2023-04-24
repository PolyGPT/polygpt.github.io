import React, { useCallback, useState } from 'react';
import ModalPortals from '../../components/ModalPortals';
import FeedbackPopup from './FeedbackPopup';
import { RATING } from '../../../../../../../codes/ChatGPT';
import useConversationStore from '../../../store/conversationStore';
import { TRANS_CHAT_GPT, TRANS_DEEPL, TRANS_ENGLISH, TRANS_GOOGLE } from '../../../../../../../codes/TransType';
import { joinLineBreak } from '../../../../../../../utils/MarkDownSplitor';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

function GenerateButton({ chat }) {
  const params = useParams();
  const conversation = useConversationStore((store) => store.conversation);
  const isGeneration = useConversationStore((store) => store.isGeneration);
  const regenerate = useConversationStore((store) => store.regenerate);
  const stopGenerating = useConversationStore((store) => store.stopGenerating);

  const onClickRegenerate = useCallback(async () => {
    if (isGeneration) {
      return;
    }
    const conversationNode = conversation.mapping[chat.parent];
    await regenerate({
      conversationNode: conversationNode,
      conversationId: params.conversationId,
    });
  }, [chat.parent, conversation.mapping, isGeneration, params.conversationId, regenerate]);

  const onClickStopGenerating = useCallback(async () => {
    stopGenerating();
  }, [stopGenerating]);

  return (
    <>
      {(!isGeneration || (isGeneration && conversation.current_node !== chat.id)) && (
        <button type="button" className="btn btn-sm text-body" onClick={onClickRegenerate} disabled={isGeneration}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-repeat" viewBox="0 0 16 16">
            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
            <path
              fillRule="evenodd"
              d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
            />
          </svg>{' '}
        </button>
      )}
      {isGeneration && conversation.current_node === chat.id && (
        <button type="button" className="btn btn-sm text-body" onClick={onClickStopGenerating}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sign-stop" viewBox="0 0 16 16">
            <path d="M3.16 10.08c-.931 0-1.447-.493-1.494-1.132h.653c.065.346.396.583.891.583.524 0 .83-.246.83-.62 0-.303-.203-.467-.637-.572l-.656-.164c-.61-.147-.978-.51-.978-1.078 0-.706.597-1.184 1.444-1.184.853 0 1.386.475 1.436 1.087h-.645c-.064-.32-.352-.542-.797-.542-.472 0-.77.246-.77.6 0 .261.196.437.553.522l.654.161c.673.164 1.06.487 1.06 1.11 0 .736-.574 1.228-1.544 1.228Zm3.427-3.51V10h-.665V6.57H4.753V6h3.006v.568H6.587Z" />
            <path
              fillRule="evenodd"
              d="M11.045 7.73v.544c0 1.131-.636 1.805-1.661 1.805-1.026 0-1.664-.674-1.664-1.805V7.73c0-1.136.638-1.807 1.664-1.807 1.025 0 1.66.674 1.66 1.807Zm-.674.547v-.553c0-.827-.422-1.234-.987-1.234-.572 0-.99.407-.99 1.234v.553c0 .83.418 1.237.99 1.237.565 0 .987-.408.987-1.237Zm1.15-2.276h1.535c.82 0 1.316.55 1.316 1.292 0 .747-.501 1.289-1.321 1.289h-.865V10h-.665V6.001Zm1.436 2.036c.463 0 .735-.272.735-.744s-.272-.741-.735-.741h-.774v1.485h.774Z"
            />
            <path
              fillRule="evenodd"
              d="M4.893 0a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146A.5.5 0 0 0 11.107 0H4.893ZM1 5.1 5.1 1h5.8L15 5.1v5.8L10.9 15H5.1L1 10.9V5.1Z"
            />
          </svg>{' '}
        </button>
      )}
    </>
  );
}

const Like = ({ conversationId, messageId, chat }) => {
  const [showPopup, setShowPopup] = useState(false);
  const translation = useConversationStore((store) => store.translation[messageId]);
  const conversation = useConversationStore((store) => store.conversation);
  const isGeneration = useConversationStore((store) => store.isGeneration);

  const [rating, setRating] = useState('');

  const onClickCopy = useCallback(
    (e) => {
      console.log(translation);
      if (translation) {
        const englishParagraphs = [];
        const googleParagraphs = [];
        const chatGPTParagraphs = [];
        const deeplParagraphs = [];
        for (const paragraphId of Object.keys(translation)) {
          const transData = translation[paragraphId];
          console.log('transData', transData);
          for (const key of Object.keys(transData)) {
            if (key === TRANS_ENGLISH) {
              englishParagraphs.push(transData[key].english);
            }
            if (key === TRANS_GOOGLE) {
              googleParagraphs.push(transData[key].other);
            }
            if (key === TRANS_CHAT_GPT) {
              chatGPTParagraphs.push(transData[key].other);
            }
            if (key === TRANS_DEEPL) {
              deeplParagraphs.push(transData[key].other);
            }
          }
        }
        const english = joinLineBreak(englishParagraphs);
        let text = `# English\n${english}`;
        if (googleParagraphs.length > 0) {
          const other = joinLineBreak(googleParagraphs);
          text += `\n\n# Google translation\n${other}`;
        }
        if (deeplParagraphs.length > 0) {
          const other = joinLineBreak(deeplParagraphs);
          text += `\n\n# Google translation\n${other}`;
        }
        if (chatGPTParagraphs.length > 0) {
          const other = joinLineBreak(chatGPTParagraphs);
          text += `\n\n# ChatGPT translation\n${other}`;
        }

        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
          progress: undefined,
          theme: 'light',
        });
        return;
      } else {
        const conversationNode = conversation.mapping[messageId];
        if (conversationNode) {
          console.log('conversationNode', conversationNode);
          if (conversationNode?.message?.content?.parts) {
            const text = `# English\n${conversationNode.message.content.parts[0]}`;
            navigator.clipboard.writeText(text);

            toast.success('Copied to clipboard', {
              position: 'top-center',
              autoClose: 3000,
              hideProgressBar: true,
              progress: undefined,
              theme: 'light',
            });
            return;
          }
        }

        toast.error('failed to copy', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
          progress: undefined,
          theme: 'light',
        });
      }
    },
    [conversation.mapping, messageId, translation],
  );

  const onClickHandup = useCallback((e, rating) => {
    e.preventDefault();
    setRating(rating);

    setShowPopup(true);
  }, []);

  const onClosePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  return (
    <div className="like">
      <button className="btn btn-sm text-body" onClick={onClickCopy} disabled={isGeneration}>
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
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      </button>
      <br />
      <button className="btn btn-sm text-body" onClick={(e) => onClickHandup(e, RATING.THUMBS_UP)} disabled={isGeneration || rating !== ''}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
        </svg>
      </button>
      <br />
      <button className="btn btn-sm text-body" onClick={(e) => onClickHandup(e, RATING.THUMBS_DOWN)} disabled={isGeneration || rating !== ''}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856 0 .289-.036.586-.113.856-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a9.877 9.877 0 0 1-.443-.05 9.364 9.364 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964l-.261.065zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a8.912 8.912 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581 0-.211-.027-.414-.075-.581-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.224 2.224 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.866.866 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1z" />
        </svg>
      </button>
      <br />
      <GenerateButton chat={chat} />
      {showPopup && (
        <ModalPortals>
          <FeedbackPopup closePopup={onClosePopup} rating={rating} conversationId={conversationId} messageId={messageId} />
        </ModalPortals>
      )}
    </div>
  );
};

export default Like;
