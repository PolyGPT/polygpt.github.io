import React, { createContext, useState, useCallback } from 'react';

export const SpinnerContext = createContext({
  spinner: false,
  showSpinner: () => {},
  hideSpinner: () => {},
});

const SpinnerProvider = ({ children }) => {
  const [spinner, setSpinner] = useState('');
  const showSpinner = useCallback(() => {
    setSpinner(true);
  }, []);

  const hideSpinner = useCallback(() => {
    setSpinner(false);
  }, []);

  return (
    <SpinnerContext.Provider
      value={{
        spinner: spinner,
        showSpinner: showSpinner,
        hideSpinner: hideSpinner,
      }}>
      {children}
    </SpinnerContext.Provider>
  );
};

export default SpinnerProvider;
