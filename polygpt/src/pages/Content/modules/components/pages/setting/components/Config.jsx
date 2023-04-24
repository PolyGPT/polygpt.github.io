import React, { useCallback } from 'react';

const checkboxMap = {
  LANGUAGE_DETECTION_BY_CHATGPT: 'Language Detection by ChatGPT',
  ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT: 'Assistant Text Translation by ChatGPT',
  SHORT_USER_TEXT_TRANSLATION_BY_CHATGPT: 'Short User Text Translation by ChatGPT',
  LONG_USER_TEXT_TRANSLATION_BY_CHATGPT: 'Long User Text Translation by ChatGPT',
};

const Config = ({ switchValues, onChangeSwitch }) => {
  const onChangeValue = useCallback(
    (e) => {
      onChangeSwitch({
        ...switchValues,
        [e.target.value]: e.target.checked,
      });
    },
    [onChangeSwitch, switchValues],
  );

  return (
    <>
      <div>
        {Object.entries(checkboxMap).map(([k, v]) => {
          return (
            <div className="row" key={k}>
              <div className="col">
                <div className="form-check form-switch">
                  <label className="form-check-label" htmlFor={k}>
                    {v}
                  </label>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id={k}
                    value={k}
                    checked={switchValues[k]}
                    onChange={onChangeValue}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Config;
