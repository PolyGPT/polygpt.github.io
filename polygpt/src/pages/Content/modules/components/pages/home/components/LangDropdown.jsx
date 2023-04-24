import React, { useCallback, useEffect, useState } from 'react';
import Languages, { getLanguage, getLanguageName } from '../../../../../../../codes/Languages';

const LangDropdown = ({ value, onChange }) => {
  const [dropdownValue, setDropdownValue] = useState(value || value !== '' || getLanguage(navigator.languages).code);
  const [showDropdown, setShowDropdown] = useState(false);

  const onClickShow = useCallback(
    (e) => {
      e.preventDefault();

      setShowDropdown(!showDropdown);
    },
    [showDropdown],
  );

  const onChangeLang = useCallback(
    (e, code) => {
      e.preventDefault();

      setShowDropdown(false);
      onChange(code);
    },
    [onChange],
  );

  useEffect(() => {
    setDropdownValue(value);
  }, [value]);

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
    <div className="btn-group w-20">
      <button className="btn btn-secondary w-100 text-start" type="button" data-bs-toggle="dropdown" aria-expanded="false" onClick={onClickShow}>
        {getLanguageName(dropdownValue)}
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
      <ul className={'dropdown-menu w-100 top-100 ' + (showDropdown ? 'show' : '')} style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {Object.entries(Languages).map(([code, name]) => (
          <li key={code}>
            <button className={'dropdown-item ' + (code === value && 'active')} onClick={(e) => onChangeLang(e, code)}>
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LangDropdown;
