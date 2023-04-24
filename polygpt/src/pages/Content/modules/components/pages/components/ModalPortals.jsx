import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ModalPortals = ({ children }) => {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (document) {
      const dom = document.querySelector('.container-fluid');
      ref.current = dom; // ref에 dom 값 전달
    }
  }, []);

  if (ref.current && mounted) {
    // mounted 됬고 dom이 존재하는 경우 모달 랜더링 진행
    return createPortal(
      <div className="modal d-block" tabIndex="-1" role="dialog">
        {children}
      </div>,
      ref.current,
    );
  }

  return null;
};

export default ModalPortals;
