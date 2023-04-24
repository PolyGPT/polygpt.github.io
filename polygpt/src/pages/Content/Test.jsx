import React from 'react';

const Test = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '1px',
        left: '1px',
        backgroundColor: 'red',
        width: '300px',
        heights: '300px',
        zIndex: 100000,
      }}
    >
      {window.location.hostname}
    </div>
  );
};

export default Test;
