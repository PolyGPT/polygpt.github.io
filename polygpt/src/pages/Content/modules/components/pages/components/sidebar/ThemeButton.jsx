import React, { useCallback, useContext, useMemo } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { LightThemeType } from '../../../codes/ThemeType';

const ThemeButton = () => {
  const themeContext = useContext(ThemeContext);
  const changeThemeType = useMemo(() => {
    if (themeContext.theme === LightThemeType) {
      return 'Dark';
    } else {
      return 'Light';
    }
  }, [themeContext.theme]);

  const onClickTheme = useCallback(
    (e) => {
      e.preventDefault();

      themeContext.changeTheme(changeThemeType.toLowerCase());
      return false;
    },
    [changeThemeType, themeContext],
  );

  return (
    <li className="nav-item">
      <a href="#" className="nav-link text-white" onClick={onClickTheme}>
        {changeThemeType} mode
      </a>
    </li>
  );
};

export default ThemeButton;
