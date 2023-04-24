import * as transType from '../codes/TransType';
import * as chatGPTTypes from '../codes/ChatGPT';
import { isDevelopment } from './utils';

const sameData = {
  targetLang: 'ko',
  sourceLang: 'en',
  model: chatGPTTypes.CONVERSACTION_MODEL_NAME,
  conversationId: '5c57ea4c-882e-420d-bcba-5aaec1024af0',
};

let testData = [
  [
    {
      text: 'What dish are you most confident in cooking?',
      dataType: transType.ORIGIN_USER,
      ...sameData,
      needTrans: true,
    },
  ],
  [
    ..."As an artificial intelligence language model, I do not have the ability to cook or taste food, so I don't have a specific dish that I am confident in cooking. However, I have access to a wide range of recipes and cooking techniques that I can share with you. Is there a particular type of cuisine or dish that you are interested in learning more about? I would be happy to provide some guidance and tips to help you improve your cooking skills."
      .split('\n\n')
      .map((v, index) => {
        return {
          text: v,
          dataType: transType.ORIGIN_ASSISTANT,
          ...sameData,
          needTrans: index % 2 === 0,
        };
      }),
  ],
  [
    {
      text: "What are the world's top three cuisines?",
      dataType: transType.ORIGIN_USER,
      ...sameData,
      needTrans: true,
    },
  ],
  [
    ..."The world's top three cuisines is a subjective matter and can vary based on personal taste and cultural background. However, there are certain cuisines that are widely recognized as some of the most popular and influential in the world.\n\n1. Italian cuisine: Italian cuisine is known for its simplicity, use of fresh ingredients, and emphasis on regional flavors. It is famous for its pasta dishes, pizzas, and seafood, as well as its use of herbs and olive oil.\n\n2. Chinese cuisine: Chinese cuisine is diverse and complex, with a wide range of regional specialties and cooking styles. It is characterized by its use of fresh ingredients, bold flavors, and a balance of sweet, salty, sour, and umami flavors.\n\n3. French cuisine: French cuisine is known for its rich and indulgent dishes, such as foie gras, cheese, and pastries. It emphasizes the use of high-quality ingredients, such as butter, cream, and wine, and is famous for its sauces and complex cooking techniques.\n\nThese are just a few examples, and there are many other great cuisines around the world that are worth exploring."
      .split('\n\n')
      .map((v, index) => {
        return {
          text: v,
          dataType: transType.ORIGIN_ASSISTANT,
          ...sameData,
          needTrans: index % 2 === 0,
        };
      }),
  ],
];

if (process.env.NODE_ENV !== 'test') {
  testData = [];
}
export { testData };
