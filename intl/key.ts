import { languageEN } from './en';

const messages = Object.keys(languageEN.messages).reduce((acc, cur) => {
  acc[cur] = cur;
  return acc;
}, {});

export const languageKEY = { lang: 'key', messages };
