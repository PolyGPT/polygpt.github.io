import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ScrollDownContext = createContext({
  showDownButton: false,
  downScroll: () => {},
});

const ScrollDownProvider = ({ children }) => {
  const [showDownButton, setShowDownButton] = useState(false);

  const onClickDown = useCallback((behavior) => {
    if (behavior) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: behavior });
    } else {
      window.scrollTo({ top: document.body.scrollHeight });
    }
  }, []);

  useEffect(() => {
    const handleShowButton = (e) => {
      e.preventDefault();

      const scrollTop = document.body.clientHeight + window.scrollY;
      if (document.body.scrollHeight > scrollTop + 100) {
        setShowDownButton(true);
      } else {
        setShowDownButton(false);
      }
    };
    window.addEventListener('scroll', handleShowButton);
    return () => {
      window.removeEventListener('scroll', handleShowButton);
    };
  }, []);
  return (
    <ScrollDownContext.Provider value={{ showDownButton, downScroll: onClickDown }}>
      {children}
      {showDownButton && (
        <button type="button" className="btn btn-floating btn-sm text-body" onClick={() => onClickDown('smooth')} id="btn-back-to-bottom">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"
            />
          </svg>
        </button>
      )}
    </ScrollDownContext.Provider>
  );
};

export default ScrollDownProvider;
