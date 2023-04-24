import React, { useCallback, useContext } from 'react';
import { SidebarContext } from '../../../context/SidebarContext';

const OpenSideMenu = () => {
  const { showSidebar } = useContext(SidebarContext);
  const onClickOpen = useCallback(
    (e) => {
      e.preventDefault();

      showSidebar();
    },
    [showSidebar],
  );
  return (
    <button className="btn btn-floating btn-sm text-body sidebar-open-btn" onClick={onClickOpen}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-justify" viewBox="0 0 16 16">
        <path
          fillRule="evenodd"
          d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"
        />
      </svg>
    </button>
  );
};

export default OpenSideMenu;
