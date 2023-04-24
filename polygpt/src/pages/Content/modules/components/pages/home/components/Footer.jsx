import React, { useCallback, useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const Footer = ({ onSendMessage }) => {
  const [value, setValue] = useState('');
  const refTimer = useRef(null);

  const send = useCallback(() => {
    if (refTimer.current === null) {
      refTimer.current = setTimeout(() => {
        refTimer.current = null;
        if (value.trim() !== '') {
          onSendMessage({ message: value });
        }
      }, 100);
    }
  }, [onSendMessage, value]);

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
    <div className="fixed-bottom footer">
      <div className="row">
        <div className="col-1"></div>
        <div className="col-10">
          <div className="hstack gap-2 input-form">
            <TextareaAutosize
              className="form-control form-control-dark"
              minRows={1}
              maxRows={15}
              onKeyDown={onKeydown}
              onChange={(e) => setValue(e.target.value)}
              value={value}
            />
            <button type="button" className="btn btn-secondary" onClick={onClickSend}>
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
          <div className="footer-text text-center">PolyGPT</div>
        </div>
        <div className="col-1"></div>
      </div>
    </div>
  );
};

export default Footer;
