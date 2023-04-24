import React, { createContext, useState, useCallback, useEffect } from 'react';
import { SIDE_APPEND_SIZE } from '../codes/Size';

export const SidebarContext = createContext({
  sidebarClassName: '',
  isAppendSidebar: false,
  showSidebar: () => {},
  hideSidebar: () => {},
});

const SidebarProvider = ({ children }) => {
  const [sidebarClassName, setSidebarClassName] = useState('');
  const [isAppendSidebar, setIsAppendSidebar] = useState(false);
  const showSidebar = useCallback((className) => {
    setSidebarClassName(className);
  }, []);

  const onWindowResize = useCallback(
    (e) => {
      setIsAppendSidebar(window.innerWidth > SIDE_APPEND_SIZE);
    },
    [setIsAppendSidebar],
  );

  useEffect(() => {
    window.addEventListener('resize', onWindowResize, false);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, [onWindowResize]);

  useEffect(() => {
    onWindowResize();
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        sidebarClassName: sidebarClassName,
        isAppendSidebar: isAppendSidebar,
        showSidebar: () => {
          showSidebar('show-sidebar');
        },
        hideSidebar: () => {
          showSidebar('');
        },
      }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;
