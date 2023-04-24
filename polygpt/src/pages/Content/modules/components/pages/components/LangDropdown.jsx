import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Languages, { getLanguage, getLanguageName } from '../../../../../../codes/Languages';

const LangDropdown = ({ value, onChange, btnStyle = 'w-100 text-start' }) => {
  const defaultLanguageCode = useMemo(() => {
    return getLanguage(navigator.languages).code;
  }, []);

  const [dropdownValue, setDropdownValue] = useState(value || defaultLanguageCode);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');

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

  const languages = useMemo(() => {
    let langs = {
      [defaultLanguageCode]: Languages[defaultLanguageCode],
      ...Object.keys(Languages)
        .filter((k) => defaultLanguageCode !== k)
        .reduce((prev, curr) => {
          return {
            ...prev,
            [curr]: Languages[curr],
          };
        }, {}),
    };

    if (searchText !== '') {
      langs = Object.entries(langs)
        .filter(([key, value]) => {
          if (key.toLowerCase() === searchText.toLowerCase()) {
            return true;
          }
          return value.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        })
        .reduce((prev, curr) => {
          return {
            ...prev,
            [curr[0]]: curr[1],
          };
        }, {});
    }

    return langs;
  }, [searchText]);

  useEffect(() => {
    setDropdownValue(value);
  }, [value]);

  return (
    <div className="btn-group w-20">
      <button className={'btn btn-secondary ' + btnStyle} type="button" data-bs-toggle="dropdown" aria-expanded="false" onClick={onClickShow}>
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
      <div className={'position-absolute w-100 top-100'} style={{ display: showDropdown ? 'block' : 'none' }}>
        <input
          type="text"
          className="form w-100 text-body bg-body p-2 ml-2"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <ul
        className={'dropdown-menu w-100 top-100 ' + (showDropdown ? 'show' : '')}
        style={{ maxHeight: '500px', overflowY: 'auto', marginTop: '45px' }}>
        {Object.entries(languages).map(([code, name]) => (
          <li key={code}>
            <a className={'dropdown-item ' + (code === value && 'active')} href="#" onClick={(e) => onChangeLang(e, code)}>
              {code} - {name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LangDropdown;
