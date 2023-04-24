import React, { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarContext } from '../../../context/SidebarContext';
import LeftMenu from './LeftMenu';
import ThemeButton from './ThemeButton';
import { EVENT_RESET_HOME } from '../../../../../../../codes/EventType';

const Sidebar = () => {
  const navigate = useNavigate();
  const { hideSidebar } = useContext(SidebarContext);

  const onClickHome = useCallback(
    (e) => {
      e.preventDefault();

      hideSidebar();
      window.postMessage({ type: EVENT_RESET_HOME });
      navigate('/');
      return false;
    },
    [hideSidebar, navigate],
  );

  const onClickSetting = useCallback(
    (e) => {
      e.preventDefault();

      hideSidebar();
      navigate('/setting');
      return false;
    },
    [hideSidebar, navigate],
  );

  const onCloseSidebar = useCallback(
    (e) => {
      e.preventDefault();

      hideSidebar();
    },
    [hideSidebar],
  );

  return (
    <div className="sidebar text-bg-dark p-3 border border-dark shadow">
      <div className="d-flex flex-column flex-shrink-0">
        <a href="#" onClick={onClickHome} className="d-flex align-items-center me-md-auto text-white text-decoration-none">
          <span>
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>{' '}
            New Chat
          </span>
        </a>
        <hr />
        <LeftMenu />
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          <ThemeButton />
          <li className="nav-item">
            <a href="#" className="nav-link text-white" onClick={onClickSetting}>
              Setting
            </a>
          </li>
        </ul>
        <button className="btn text-white sidebar-close" onClick={onCloseSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
