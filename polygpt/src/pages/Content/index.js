import Browser from 'webextension-polyfill';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { EVENT_LOGIN_CHAT_GPT } from '../../codes/EventType';
import App from './modules/components/App';
import { POLY_SITE, TEST_SITE } from '../../codes/Common';
import { OPEN_AI_URL } from '../../codes/ChatGPT';

window.addEventListener('load', () => {
  if (window.location.href.indexOf(TEST_SITE) !== -1 || window.location.href.indexOf(POLY_SITE) !== -1) {
    require('./content.styles.scss');
    require('highlight.js/styles/base16/gigavolt.css');

    const root = createRoot(document.getElementById('root')); // createRoot(container!) if you use TypeScript
    root.render(<App />);
  }

  if (window.location.href === `${OPEN_AI_URL}/` || window.location.href.indexOf(`${OPEN_AI_URL}/c/`) !== -1) {
    if (window.__NEXT_DATA__) {
      (async function () {
        try {
          await Browser.runtime.sendMessage({
            type: EVENT_LOGIN_CHAT_GPT,
          });
        } catch {}
        const ID = '__POLY_GPT__';
        const $img = document.createElement('img');
        $img.src = Browser.runtime.getURL('poly-128.png');
        $img.style.width = '48px';
        $img.style.height = '48px';
        const $div = document.createElement('div');
        $div.id = ID;
        $div.style.position = 'absolute';
        $div.style.bottom = '120px';
        $div.style.right = '1.5rem';
        $div.style.zIndex = 10000;
        $div.style.display = 'none';
        $div.style.cursor = 'pointer';
        $div.onclick = () => {
          window.open(POLY_SITE, '_blank');
        };
        $div.appendChild($img);
        document.body.appendChild($div);

        // var config = { attributes: false, childList: true };
        // const callback = (mutationsList) => {
        //   console.log('mutationsList', mutationsList);
        // };

        // var observer = new MutationObserver(callback);
        // const $container = document.body.querySelector('main.relative>div.overflow-hidden');
        // console.log('$container', $container);
        // observer.observe($container, config);

        setInterval(() => {
          const $scrollPanel = document.body.querySelector('main.relative>div.overflow-hidden>div.h-full>div');
          if ($scrollPanel) {
            const { scrollTop, scrollHeight, clientHeight } = $scrollPanel;
            if (document.body.clientWidth > 768) {
              if (scrollTop + clientHeight === scrollHeight) {
                $div.style.display = 'block';
              } else {
                $div.style.display = 'none';
              }
            } else {
              $div.style.display = 'none';
            }
          } else {
            $div.style.display = 'none';
          }
        }, 100);
      })();
    }
  }
});
