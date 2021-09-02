import { oldMessages } from './en';
import * as messages from './messages';
import * as koMessages from './messages/ko';

export const languageKO = {
  lang: 'ko',
  messages: [oldMessages, ...Object.values(messages), ...Object.values(koMessages)].reduce((result, messageData) => {
    return { ...result, ...messageData };
  }, {}),
};
