import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import { ThemeContext } from '../context/ThemeContext';
import { SidebarContext } from '../context/SidebarContext';
import BackgroundMessage from './components/BackgroundMessage';
import useConversationStore from '../store/conversationStore';
import { SpinnerContext } from '../context/SpinnerContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollDownProvider from '../context/ScrollDownContext';
import ExceptionContainer from './components/ExceptionContainer';

const Layout = () => {
  const param = useParams();
  const { sidebarClassName, hideSidebar, isAppendSidebar } = useContext(SidebarContext);
  const { spinner } = useContext(SpinnerContext);
  const { theme } = useContext(ThemeContext);

  const getUserSession = useConversationStore((store) => store.getUserSession);
  const init = useConversationStore((state) => state.init);
  const config = useConversationStore((state) => state.config);

  useEffect(() => {
    getUserSession();
    init();
  }, []);

  return (
    <>
      <ExceptionContainer>
        {config.user_language && (
          <div
            className={'container-fluid d-flex flex-nowrap ' + sidebarClassName + (isAppendSidebar ? ' append-sidebar' : '')}
            data-bs-theme={theme}>
            <main className="contents text-body bg-body position-relative">
              <ScrollDownProvider>
                <Outlet />
                <BackgroundMessage />
              </ScrollDownProvider>
            </main>
            <Sidebar />
            <div className="side-dim" onClick={(e) => hideSidebar()}></div>
          </div>
        )}
      </ExceptionContainer>
      {spinner && (
        <div className="loader-wrap">
          <div className="loader position-absolute bottom-50 start-50 translate-middle translate-middle-y">Loading...</div>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default Layout;
