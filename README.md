# polygpt.github.io

# PolyGPT

- PolyGPT와 함께 ChatGPT 와 편하고 효율적으로 대화하세요 - 여러 언어를 구사하는 개인 AI 어시스턴트인 PolyGPT와 함께라면 ChatGPT 와 모국어로 편하게 대화해도 영어로 대화하는 수준의 대화가 가능합니다.

## 서비스 링크

- https://polygpt.github.io/
- 주의사항: 아직 크롬 웹스토어에 정식 등록되어 있지 못합니다. 위 URL 에서 확장앱을 직접 다운로드 받아 설치 부탁드립니다. 자세한 사항은 위 사이트에 설명되어 있습니다.

## 설치

- 크롬 익스텐션 설치 파일인 [poly-gpt-chrome-extension-1.0.0.zip] 를 다운로드하고, 압축해제 합니다.
- 크롬 브라우저에서 chrome://extensions/ 에 접속합니다.
- 오른쪽 상단의 [개발자 모드] 부분을 활성화 합니다.
- 왼쪽 상단의 [압축 해제된 확장 프로그램을 로드합니다] 버튼을 클릭합니다.
- 1번에서 압축해제한 폴더를 지정하고 [선택] 버튼을 누릅니다.
- 보고 계신 이 페이지를 새로고침하거나 polygpt.github.io 에 다시 접속합니다.
- 추후 크롬 웹스토어에 정식 등록되면 훨씬 더 쉽게 설치하실 수 있습니다. 빨리 정식 등록이 될 수 있도록 하겠습니다.
- (Optional) DeepL 번역을 하려면 DeepL chrome extention 도 추가로 설치가 필요합니다.

## 핵심 기능

- User 및 Assistant (ChatGPT) 의 언어 종류 자동 인식
- 인식된 언어 종류에 맞춰 적절한 기계 번역
- 기계 번역은 구글 번역 뿐만 아니라 DeepL 번역 및 ChatGPT 를 이용한 번역 모두 활용
- 번역된 내용이 아래쪽이 아니라 옆에 나오도록 함과 동시에 문단 별로 모국어/영어를 정렬하여 가독성 향상
- 타 Chrome Extention 과의 충돌 원천 방지

## 배경

- 현재 한국어를 영어로 자동 번역하여 ChatGPT 를 사용할 수 있도록 하는 ‘프롬프트 지니’ 라는 Chrome Extention 이 있습니다.
- 이를 주로 많이 사용하였으나 번역 내용이 아래쪽에 나와 가독성이 떨어지는 문제, 구글 번역만 활용할 수 있는 문제, 한글만 가능하다는 문제, 타 Chrome Extention 과 충돌이 발생하는 문제 등으로 인해 활용하기에 불편한 점이 있었습니다.
- 이에 이러한 문제점을 모두 해결하고자 PolyGPT 라는 서비스를 기획하게 되었습니다.

## 기대효과

- Non-Native English Speaker 가 편하게 모국어로 ChatGPT 를 효율적으로 활용하실 수 있습니다.
- 영어로 정밀하게 제어하고 싶은 경우에는 그냥 영어로 입력하면 됩니다.
- 타 Chrome Extention 과의 충돌 없이 편하게 활용 가능합니다.

## 기술 세부 내용

### ChatGPT 요청 Queue 구현

- 현재 ChatGPT web UI 는 여러개 띄워 놓고 동시에 호출하면 에러가 발생함
- PolyGPT 는 User 의 ChatGPT 요청 뿐만 아니라 번역 및 언어 인식에도 ChatGPT 를 사용해야 하기 때문에 이는 치명적임
- 따라서 자체적으로 요청 Queue 를 구현하여 동시 호출 에러를 방지함

### 자동 언어 인식

- 기본적으로는 Chrome 에서 제공하는 Language Detection 기능 사용
- 실패 시 ChatGPT 를 이용하여 Language Detection
- 이를 통해 영어는 한글 등 모국어로, 모국어는 영어로 번역

### 기계 번역

- 구글 번역
- DeepL 번역
  - 단, DeepL 번역은 구글 번역처럼 직접적으로 활용하는 것은 막아 놓았기에
  - DeepL Chrome Extention 을 활용하여 편리하게 DeepL 번역을 할 수 있도록 UI 구성
- ChatGPT 를 이용한 번역
  - 단, 길이가 긴 경우에는 제대로 번역이 되지 못하고 짤리는 문제가 다수 발생하기에
  - 문단 단위로 하나씩 번역

### 자체 UI 구현 (polygpt.github.io)

- 일반적인 방식인 ChatGPT UI 에 injection 하여 수정하는 방식이 아니라 자체 UI 로 구현
- 따라서 충돌 문제가 원천적으로 방지됨
- 또한 번역 내용을 아래쪽이 아니라 옆쪽에 나오도록 구성이 가능
- 접근성 향상을 위해 ChatGPT 사이트에서 PolyGPT 페이지로 갈 수 있도록 하는 Floating Icon 하나만 injection

# PolyGPT

- Talk to ChatGPT comfortably and efficiently with PolyGPT - With PolyGPT, your personal multilingual AI assistant, you can talk to ChatGPT in your native language and still be as comfortable as if you were having a conversation in English.

## Service Link

- https://polygpt.github.io/
- Note: The extension is not yet listed on the Chrome Web Store. Please download and install the extension directly from the above URL. Details are explained on the site above.

## Install

- Download and extract the Chrome extension installation file [poly-gpt-chrome-extension-1.0.0.zip].
- Access chrome://extensions/ in the Chrome browser.
- Enable the [Developer Mode] section in the top right corner.
- Click the [Load unzipped extension] button on the top left.
- Specify the folder you extracted in step 1 and press the [Select] button.
- Refresh this page you are viewing or reconnect to polygpt.github.io.
- It will be much easier to install once it is officially listed on the Chrome Web Store. We hope to have it listed as soon as possible.
- (Optional) DeepL chrome extension will also need to be installed in order to translate DeepL.

## Core Features

- Automatically recognizes the language type of the user and assistant (ChatGPT)
- Appropriate machine translation based on the recognized language type
- Machine translation utilizes not only Google Translate, but also DeepL translation and translation using ChatGPT.
- Improved readability by aligning the native language/English per paragraph while keeping the translated content on the side instead of at the bottom.
- Prevent conflicts with other Chrome extensions at source

## Background.

- There is currently a Chrome Extension called 'Prompt Genie' that automatically translates Korean to English so that you can use ChatGPT.
- I used it a lot, but it was inconvenient to use due to the problem that the translation content is displayed at the bottom and is not readable, the problem that only Google Translate can be utilized, the problem that only Korean is available, and the problem that conflicts with other Chrome Extensions.
- In order to solve all of these problems, we have planned a service called PolyGPT.

## Expected Benefits

- Non-Native English Speakers can easily utilize ChatGPT in their native language.
- If you want to have precise control in English, you can just type in English.
- No conflicts with other Chrome extensions.

## Technical Details

### ChatGPT request queue implementation

- Currently, the ChatGPT web UI causes an error when multiple requests are opened at the same time.
- This is fatal because PolyGPT needs to use ChatGPT not only for user's ChatGPT requests, but also for translation and language recognition.
- Therefore, we implemented our own request queue to avoid concurrent call errors.

### Automatic language recognition

- By default, we use the Language Detection feature provided by Chrome.
- If it fails, we use ChatGPT to detect the language.
- This translates English to native language, such as Korean, and native language to English.

### Machine Translation

- Google Translate
- DeepL translation
  - However, DeepL translation cannot be utilized directly like Google Translate.
  - Configure the UI so that you can use DeepL Chrome Extension to translate DeepL conveniently.
- Translation using ChatGPT
  - However, if the length is long, there are many problems that cannot be translated properly and are truncated.
  - Translate paragraph by paragraph

### Implement your own UI (polygpt.github.io)

- We implemented our own UI instead of injecting it into the ChatGPT UI and modifying it in the usual way.
- This avoids conflicts altogether
- Can be configured to display translations on the side instead of the bottom
- For better accessibility, only one floating icon is injected that allows you to navigate to the PolyGPT page from the ChatGPT site.

[AGPL license](https://www.gnu.org/licenses/agpl-3.0.html)
