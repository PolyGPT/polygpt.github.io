import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const PencilHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" version="1.1" viewBox="0 0 500 500" id="ico_pencel" xmlnsXlink="http://www.w3.org/1999/xlink">
<g id="Layer_x0020_1">
  <metadata id="CorelCorpID_0Corel-Layer" />
  <polygon style="fill: #CBCBCB" points="77,320 179,422 81,455 45,418 " />
  <rect
    style="fill: #0078C8"
    transform="matrix(0.850297 0.850297 -0.942726 0.942726 362.109 171.621)"
    width="39.997"
    height="229.998"
  />
  <rect
    style="fill: #008EED"
    transform="matrix(0.850297 0.850297 -0.942717 0.942717 328.095 137.608)"
    width="39.999"
    height="230.001"
  />
  <path style="fill: #17A2FF" d="M77 320l34 34 217 -216 68 68 17 -17 -102 -102c-71,70 -163,163 -234,233z" />
  <path
    style="fill: #303030"
    d="M38 470l62 -21c2,-1 3,-2 4,-3 0,-2 0,-4 0,-5 -4,-10 -11,-19 -18,-27 -8,-8 -17,-14 -27,-18 -2,-1 -3,-1 -5,0 -1,1 -3,2 -3,4l-21 62c-1,2 0,5 1,6 2,2 4,2 7,2z"
  />
  <path style="fill: #ED2F00" d="M387 35l79 79c6,6 6,16 0,22l-53 52 -102 -102 51 -51c7,-7 18,-7 25,0z" />
</g>
</svg>`;

const md = new MarkdownIt({
  breaks: true,
  html: true,
  linkify: true,
  typographer: false,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><div class="row m-0 py-1 code-header"><div class="col-6 text-start language-label">${lang.toUpperCase()}</div><div class="col-6 copy text-end"></div></div><code class="hljs ${lang}">${
          hljs.highlight(str, { language: lang }).value
        }</code></pre>`;
      } catch (__) {}
    }
    return `<pre><div class="row m-0 py-1 code-header"><div class="col-6 text-start language-label"></div><div class="col-6 copy text-end"></div></div><code class="hljs">${md.utils.escapeHtml(
      str,
    )}</code></pre>`;
  },
});

const addCopyButtons = (container) => {
  container.querySelectorAll('pre code.hljs').forEach((codeBlock) => {
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.classList.add('copy-button');

    copyButton.addEventListener('click', () => {
      const range = document.createRange();
      range.selectNodeContents(codeBlock);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      document.execCommand('copy');
      selection.removeAllRanges();

      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 2000);
    });

    if (codeBlock.parentNode.querySelector('.copy')) {
      codeBlock.parentNode.querySelector('.copy').appendChild(copyButton);
    }
  });
};

function MarkdownViewer({ message, messageId, generateMessageId }) {
  const markdownContentElement = useRef(null);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    try {
      if (!message || message === '') {
        setHtmlContent('');
        return;
      } else {
        const html = md.render(message);
        setHtmlContent(html);
      }
    } catch (e) {
      console.error(e);
    }
  }, [message]);

  useEffect(() => {
    if (markdownContentElement.current) {
      addCopyButtons(markdownContentElement.current);
    }
  }, [htmlContent]);

  useLayoutEffect(() => {
    if (markdownContentElement.current !== null) {
      if (messageId && messageId === generateMessageId) {
        var $span = document.createElement('span');
        $span.innerHTML = PencilHTML;

        const getLastNode = (node) => {
          const children = [];
          for (let index = 0; index < node.childNodes.length; index++) {
            const child = node.childNodes[index];
            if (child.nodeName === '#text' && child.nodeValue === '\n') {
              continue;
            }
            children.push(child);
          }
          const last = children[children.length - 1];

          if (last === undefined || last.length === 0 || last.nodeName === '#text') {
            return node;
          }

          return getLastNode(last);
        };
        const lastNode = getLastNode(markdownContentElement.current);
        lastNode.appendChild($span.firstChild);
      }

      if (generateMessageId === null) {
        if (document.body.querySelector('#ico_pencel')) {
          const pencil = document.body.querySelector('#ico_pencel');
          pencil.parentElement.removeChild(pencil);
        }
      }
    }
  }, [message, messageId, generateMessageId, htmlContent]);

  if (message === '') {
    return null;
  }

  return <div className="markdown" dangerouslySetInnerHTML={{ __html: htmlContent }} ref={markdownContentElement} />;
}

export default MarkdownViewer;
