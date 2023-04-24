import React from 'react';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import routes from './routes';
import SidebarProvider from './context/SidebarContext';
import ThemeProvider from './context/ThemeContext';
import SpinnerProvider from './context/SpinnerContext';

const App = () => {
  return (
    <SidebarProvider>
      <ThemeProvider>
        <SpinnerProvider>
          <RouterProvider router={createHashRouter(routes)} />
        </SpinnerProvider>
      </ThemeProvider>
    </SidebarProvider>
  );
};

export default App;
