import { Browser, detect } from 'detect-browser';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { logException } from './logException';

type Rule = {
  wildcard: string;
  openTag: string;
  closeTag: string;
};

// formatting rules: https://faq.whatsapp.com/general/chats/how-to-format-your-messages
const rules: Rule[] = [
  // Bold
  {
    wildcard: '*',
    openTag: '<strong>',
    closeTag: '</strong>',
  },
  // Italic
  {
    wildcard: '_',
    openTag: '<em>',
    closeTag: '</em>',
  },
  // Strikethrough
  {
    wildcard: '~',
    openTag: '<del>',
    closeTag: '</del>',
  },
  // FIXME: Monospace
  {
    openTag: '<code>',
    closeTag: '</code>',
    wildcard: '```',
  },
];

const isStringOrNumber = (char: any) => isString(char) || isNumber(char);
const checkIsNewLineCharacter = (char: string) => char.charCodeAt(0) === 10;

/**
 * @param text formattable string
 * @param rule formatting rule
 * @returns indexes of wildcard which will be replaced to tag
 */
const getIndexes = (text: string, rule: Rule) => {
  const indexes: number[] = [];
  const { wildcard } = rule;

  text.split('').forEach((char, index) => {
    if (char === wildcard) {
      const next = text[index + 1];
      const prev = text[index - 1];

      if (indexes.length % 2 === 0) {
        // open tag wildcard
        if (next !== undefined && next !== ' ') {
          indexes.push(index);
          return;
        }
      } else {
        // close tag wildcard
        if (prev !== ' ' && isStringOrNumber(prev)) {
          indexes.push(index);
          return;
        }
      }
    } else if (checkIsNewLineCharacter(char) && indexes.length % 2) {
      // new line('\n') character detected, before close tag wildcard detected.
      indexes.pop();
    }
  });

  if (indexes.length % 2 !== 0) {
    indexes.pop();
  }

  return indexes;
};

const format = (text: string, rule: Rule) => {
  const { openTag, closeTag } = rule;
  const result: string[] = text.split('');

  if (text.length < 3) {
    // If the text length is less than 3, you do not need to format the message.
    return text;
  }

  const indexes = getIndexes(text, rule);
  indexes.forEach((wcIndex, index) => {
    const tag = index % 2 === 0 ? openTag : closeTag;
    result.splice(wcIndex, 1, tag); // Replace wildcard to open/close tag
  });

  return result.join('');
};

export const formatWhatsAppMessage = (message: string) => {
  let result = message;

  const browser = detect();
  const lookbehindSyntaxSupportedBrowsers: Browser[] = ['chrome', 'edge', 'firefox', 'opera'];
  if (browser && lookbehindSyntaxSupportedBrowsers.some((browserName) => browser.name === browserName)) {
    rules.forEach(({ wildcard, openTag, closeTag }) => {
      try {
        const regexp = new RegExp(`${wildcard}(?=\\S)([\\S|\\s]+?)(?<=\\S)${wildcard}`, 'gm');
        const matches: RegExpExecArray[] = [];

        let matched;
        while (null != (matched = regexp.exec(result))) {
          matches.push(matched);
        }

        if (matches.length > 0) {
          matches.forEach((match) => {
            const matchedText = match[0];
            const formattableText = match[1];
            result = result.split(matchedText).join(`${openTag}${formattableText}${closeTag}`);
          });
        }
      } catch (error) {
        logException(error);
      }
    });
  } else {
    rules
      .filter((rule) => rule.wildcard !== '```')
      .forEach((rule) => {
        result = format(result, rule);
      });
  }

  return result;
};
