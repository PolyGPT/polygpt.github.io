import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import OpenSideMenu from '../components/sidebar/OpenSideMenu';
import LangDropdown from '../components/LangDropdown';
import useConversationStore from '../../store/conversationStore';
import { useNavigate } from 'react-router-dom';
import Config from './components/Config';
import { toast } from 'react-toastify';

const Setting = () => {
  const [switchValues, setSwitchValues] = useState({
    LANGUAGE_DETECTION_BY_CHATGPT: false,
    ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT: false,
    SHORT_USER_TEXT_TRANSLATION_BY_CHATGPT: false,
    LONG_USER_TEXT_TRANSLATION_BY_CHATGPT: false,
  });
  const config = useConversationStore((state) => state.config);
  const updateConfig = useConversationStore((state) => state.updateConfig);
  const getPrompt = useConversationStore((state) => state.getPrompt);
  const setPrompt = useConversationStore((state) => state.setPrompt);

  const resetConfigs = useConversationStore((state) => state.resetConfigs);
  const exportConfigs = useConversationStore((state) => state.exportConfigs);
  const importConfigs = useConversationStore((state) => state.importConfigs);

  const oldPrompt = useConversationStore((state) => state.prompt);

  const [lang, setLang] = useState(config.user_language);

  const [newPrompt, setNewPrompt] = useState(() => ({}));

  const onChangeLang = useCallback((lang) => {
    console.log('onChangeLang', lang);
    setLang(lang);
  }, []);

  useEffect(() => {
    getPrompt();
  }, [getPrompt]);

  const [keyList, setKeyList] = useState(() => []);

  useEffect(() => {
    setLang(config.user_language);
  }, [config.user_language]);

  useEffect(() => {
    if (Object.keys(oldPrompt).length > 0) {
      setNewPrompt(() => ({ ...oldPrompt }));
      setSwitchValues({
        LANGUAGE_DETECTION_BY_CHATGPT: oldPrompt.LANGUAGE_DETECTION_BY_CHATGPT,
        ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT: oldPrompt.ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT,
        SHORT_USER_TEXT_TRANSLATION_BY_CHATGPT: oldPrompt.SHORT_USER_TEXT_TRANSLATION_BY_CHATGPT,
        LONG_USER_TEXT_TRANSLATION_BY_CHATGPT: oldPrompt.LONG_USER_TEXT_TRANSLATION_BY_CHATGPT,
      });
    }
  }, [oldPrompt]);

  useEffect(() => {
    setKeyList([
      'DETECT_LANG_PROMPT',
      'ASSISTANT_TEXT_TRANSLATION_BY_CHATGPT_PROMPT',
      'USER_TEXT_TRANSLATION_BY_CHTATGPT_PROMPT',
      'SUPPORT_CONVERSATION_OPENING_PROMPT',
    ]);
  }, [newPrompt]);

  const onClickSave = useCallback(
    async (e) => {
      e.preventDefault();
      const config = {
        user_language: lang,
      };

      await updateConfig(config);
      await setPrompt({ ...newPrompt, ...switchValues });

      toast.success('Settings have been saved.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        progress: undefined,
        theme: 'light',
      });
    },
    [lang, newPrompt, setPrompt, switchValues, updateConfig],
  );

  const fileInputRef = useRef();
  const onClcikImportBtn = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const onClcikResetBtn = useCallback(() => {
    resetConfigs();
  }, [resetConfigs]);

  const onChangeFile = useCallback(
    (e) => {
      const file = e.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        await importConfigs(JSON.parse(fileReader.result));
      };
      fileReader.readAsText(file);
    },
    [importConfigs],
  );

  const onClickExportBtn = useCallback(async () => {
    const json = await exportConfigs();
    const link = document.createElement('a');
    link.download = 'settings.json';
    link.href = URL.createObjectURL(json);
    link.click();
    link.remove();
  }, [exportConfigs]);

  return (
    <div className="px-3 py-5 text-body bg-body" id="setting">
      <input type="file" accept="application/json" ref={fileInputRef} style={{ display: 'none' }} onChange={onChangeFile} />
      <div className="row border-bottom">
        <div className="col-2"></div>
        <div className="col-8">
          <h2 className="pb-2 px-2">
            <OpenSideMenu />
            Setting
          </h2>
        </div>

        <div className="col-2">
          <div style={{ justifyContent: 'flex-end', display: 'flex' }} className="gap-2">
            <button className="btn btn-warning" type="submit" onClick={onClcikResetBtn}>
              reset default
            </button>
            <button className="btn btn-primary" type="submit" onClick={onClcikImportBtn}>
              import
            </button>
            <button className="btn btn-primary" type="submit" onClick={onClickExportBtn}>
              export
            </button>
          </div>
        </div>
      </div>
      <div className="row g-4 py-5">
        <div className="col-2"></div>
        <div className="col-8">
          <div className="row g-3 text-body bg-body">
            <div className="col-12">
              <div>
                <label className="form-label">Language</label>
              </div>
              <LangDropdown value={lang} onChange={onChangeLang} />
            </div>
            {keyList.map((k) => {
              return (
                <div className="col-12" key={k}>
                  <label htmlFor={k} className="form-label">
                    {k}
                  </label>
                  {newPrompt[k] !== undefined && (
                    <TextareaAutosize
                      id={k}
                      className="form-control"
                      minRows={newPrompt[k].split('\n').length >= 2 ? 5 : 2}
                      maxRows={newPrompt[k].split('\n').length >= 2 ? 20 : 5}
                      onChange={(e) =>
                        setNewPrompt(() => ({
                          ...newPrompt,
                          [k]: e.target.value,
                        }))
                      }
                      value={newPrompt[k]}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <hr className="my-4"></hr>
          <Config switchValues={switchValues} onChangeSwitch={(values) => setSwitchValues(values)} />
          <hr className="my-4"></hr>
          <button className="btn btn-outline-success btn-lg w-100" type="submit" onClick={onClickSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;
