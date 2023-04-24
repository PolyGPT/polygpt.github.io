import React from 'react';

import InputForm from './InputForm';

const Footer = () => {
  return (
    <div className="fixed-bottom footer">
      <div className="row">
        <div className="col-1"></div>
        <div className="col-10">
          <InputForm />
          <div className="footer-text text-center">PolyGPT</div>
        </div>
        <div className="col-1"></div>
      </div>
    </div>
  );
};

export default Footer;
