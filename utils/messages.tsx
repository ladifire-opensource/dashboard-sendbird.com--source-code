import React from 'react';

import moment from 'moment-timezone';
import { BaseMessageInstance } from 'sendbird';

import { EMAIL_PARSE_REGEX, URL_PARSE_REGEX } from '@constants';

import { getExtension, convertNodeArrayToReactFragment } from './generals';

const CMD_MESG = 'MESG';
const CMD_FILE = 'FILE';
const CMD_ADMM = 'ADMM';
const CMD_BRDM = 'BRDM';

export enum MessageType {
  user = 'user',
  file = 'file',
  admin = 'admin',
}

export const platformMessageTypeChecker = {
  isUserMessage: (apiMessage) => {
    return apiMessage.type === CMD_MESG;
  },
  isFileMessage: (apiMessage) => {
    return apiMessage.type === CMD_FILE;
  },
  isAdminMessage: (apiMessage) => {
    return apiMessage.type === CMD_ADMM || apiMessage.type === CMD_BRDM;
  },
};

export const getSDKMessageTypeFromPlatformAPIMessage = (message: Pick<SendBirdAPIMessage, 'type'>) => {
  return {
    [CMD_FILE]: MessageType.file,
    [CMD_ADMM]: MessageType.admin,
    [CMD_BRDM]: MessageType.admin,
    [CMD_MESG]: MessageType.user,
  }[message.type];
};

export const sdkMessageTypeChecker = {
  isUserMessage: (message: Pick<BaseMessageInstance, 'messageType'>) => {
    return message.messageType === MessageType.user;
  },

  isFileMessage: (message: Pick<BaseMessageInstance, 'messageType'>) => {
    return message.messageType === MessageType.file;
  },

  isAdminMessage: (message: Pick<BaseMessageInstance, 'messageType'>) => {
    return message.messageType === MessageType.admin;
  },
};

export const shouldRenderImage = (type: string, url: string | null) => {
  if (!url) {
    // it prevent `url` null runtime error
    return false;
  }
  const fileExtension = getExtension(url);

  const imageExtensions = [
    'bmp',
    'cod',
    'gif',
    'ief',
    'jpe',
    'jpeg',
    'jpg',
    'jfif',
    'svg',
    'tif',
    'tiff',
    'ras',
    'cmx',
    'ico',
    'pnm',
    'pbm',
    'pgm',
    'ppm',
    'rgb',
    'xbm',
    'xpm',
    'xwd',
    'png',
  ];

  return type.match(/^image.+$/i) || (type === 'application/octet-stream' && imageExtensions.includes(fileExtension));
};

/**
 * shouldRenderDateLine
 *
 * @description check whether render dateline. it compare two datetime or date
 * @param previousDate
 * @param nextDate
 */
export function shouldRenderDateLine({
  previousDate,
  nextDate,
}: {
  previousDate: string | number;
  nextDate: string | number;
  timezone?: string | undefined;
}) {
  return (
    moment(previousDate).isBefore(moment(nextDate), 'date') ||
    moment(previousDate).isBefore(moment(nextDate), 'month') ||
    moment(previousDate).isBefore(moment(nextDate), 'year')
  );
}

const convertURLToLink = (token: string): React.ReactNode =>
  token.match(URL_PARSE_REGEX) ? (
    <a href={token} target="_blank">
      {token}
    </a>
  ) : (
    token
  );

const convertEmailToLink = (token: string) =>
  token.match(EMAIL_PARSE_REGEX) ? <a href={`mailto:${token}`}>{token}</a> : token;

export const convertURLsAndEmailsToLinks = (message: string) => {
  if (!message) {
    return null;
  }
  return convertNodeArrayToReactFragment(
    message
      .split(new RegExp(`(${URL_PARSE_REGEX.source})`)) // add parentheses to capture delimiters (URLs)
      .map(convertURLToLink)
      .map((token) => {
        if (typeof token !== 'string') {
          return token;
        }
        return convertNodeArrayToReactFragment(
          token
            .split(new RegExp(`(${EMAIL_PARSE_REGEX.source})`)) // add parentheses to capture delimiters (emails)
            .map(convertEmailToLink),
        );
      }),
  );
};

export const convertMessageWithCustomRule = (
  message: string,
  customRule: { regex: RegExp; converter: (token: string) => React.ReactNode },
) => {
  if (!message) {
    return null;
  }

  const convertedEmailToLink = message
    .split(new RegExp(`(${EMAIL_PARSE_REGEX.source})`)) // add parentheses to capture delimiters (URLs)
    .map(convertEmailToLink);

  let convertedByCustomRule: React.ReactNode[] = [];
  convertedEmailToLink.forEach((token) => {
    if (typeof token === 'string') {
      convertedByCustomRule = convertedByCustomRule.concat(token.split(customRule.regex).map(customRule.converter));
    } else {
      convertedByCustomRule.push(token);
    }
  });

  return convertNodeArrayToReactFragment(
    convertedByCustomRule.map((token) => {
      if (typeof token !== 'string') {
        return token;
      }
      return convertNodeArrayToReactFragment(
        token
          .split(new RegExp(`(${URL_PARSE_REGEX.source})`)) // add parentheses to capture delimiters (emails)
          .map(convertURLToLink),
      );
    }),
  );
};
