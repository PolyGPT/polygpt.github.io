import React from 'react';

import Sidebar from './pages/components/sidebar/Sidebar';
import Contents from './contents/Contents';

const Container = () => {
  return (
    <div class="container-fluid d-flex flex-nowrap">
      <Sidebar />
      <Contents />
    </div>
  );
};

export default Container;
