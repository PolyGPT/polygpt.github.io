import React from 'react';
import Layout from '../pages/Layout';
import Home from '../pages/home';
import Chat from '../pages/chat';
import Setting from '../pages/setting';

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/chat/:conversationId',
        element: <Chat />,
      },
      {
        path: '/setting',
        element: <Setting />,
      },
    ],
  },
];

export default routes;
