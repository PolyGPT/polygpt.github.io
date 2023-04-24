import React, { useState, useEffect, useCallback } from 'react';
import useConversationStore from '../../../store/conversationStore';

const ModelDropdown = ({ selectModel }) => {
  const models = useConversationStore((state) => state.models);
  const [model, setModel] = useState(null);
  const [infoModel, setInfoModel] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const onClickSelect = useCallback(
    (m) => {
      setModel(m);
      setShowDropdown(false);
      selectModel(m.slug);
    },
    [selectModel],
  );

  useEffect(() => {
    if (model === null && models.length > 0) {
      setModel(models[0]);
      if (selectModel) {
        selectModel(models[0].slug);
      }
    }
  }, [model, models, models.length, selectModel]);

  useEffect(() => {
    const onClick = (e) => {
      if (showDropdown) {
        e.preventDefault();
        setTimeout(() => {
          setShowDropdown(false);
        }, 500);
      }
    };
    window.addEventListener('mousedown', onClick, false);
    return () => {
      window.removeEventListener('mousedown', onClick);
    };
  }, [showDropdown]);

  return (
    <div className="btn-group model-dropdown w-20">
      <button
        type="button"
        className="btn btn-secondary w-100 text-start"
        data-bs-toggle="dropdown"
        data-bs-display="static"
        aria-expanded="false"
        onClick={() => setShowDropdown(!showDropdown)}>
        {model && model.title}
      </button>
      <button
        type="button"
        className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        data-bs-reference="parent"
        onClick={() => setShowDropdown(!showDropdown)}>
        <span className="visually-hidden">Toggle Dropdown</span>
      </button>
      <ul className={'dropdown-menu dropdown-menu-lg-end w-100 top-100' + (showDropdown ? ' show' : '')}>
        {models.map((item) => (
          <li key={item.slug} onMouseEnter={() => setInfoModel(item)} onMouseLeave={() => setInfoModel(null)}>
            <button
              className={'dropdown-item ' + (model && model.slug === item.slug ? 'active' : '')}
              type="button"
              onClick={() => onClickSelect(item)}>
              {item.title}
            </button>
          </li>
        ))}
      </ul>
      {infoModel && (
        <div className="card model-info text-start">
          <div className="card-body">
            <h5 className="card-title  text-start">{infoModel.title}</h5>
            <p className="card-text fs-6  text-start">{infoModel.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelDropdown;
