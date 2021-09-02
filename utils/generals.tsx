import React from 'react';

import camelCase from 'lodash/camelCase';
import mapKeys from 'lodash/mapKeys';
import snakeCase from 'lodash/snakeCase';
import moment, { Moment, unitOfTime } from 'moment-timezone';
import numbro from 'numbro';

import {
  URI_REGEX,
  BYTES_PER_GIGABYTE,
  AverageFeatures,
  CardBrandsNew,
  CLOUD_FRONT_URL,
  CardBrands,
  ChatFeatureName,
} from '@constants';

import { logException } from './logException';

String.prototype.hashCode = function () {
  let hash = 0,
    i,
    chr,
    len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const isEmpty = (val) => {
  if (null == val) return true;
  if ('boolean' === typeof val) return false;
  if ('number' === typeof val) return 0 === val;
  if (undefined !== val.length) return 0 === val.length;

  if (val instanceof Object) {
    return Object.keys(val).length === 0;
  }
  return true;
};

export const fixedEncodeURIComponent = (str: string): string => {
  /**
   * This function makes a string portable, so it can be transmitted across any network to any computer that supports ASCII characters.
   * @param char !, ', (, ), *
   */
  const encode = function encodeSpecialCharacters(char: string): string {
    return `%${char.charCodeAt(0).toString(16)}`.toUpperCase();
  };

  return encodeURIComponent(str).replace(/[!'()*]/g, encode);
};

export const getRandomNumber = (str, divider: number) => {
  if (str) {
    const numberFromHash = Math.abs(String(str).hashCode()) % divider;

    return numberFromHash + 1;
  }
  return Math.abs(String('getRandomNumber').hashCode()) % divider;
};

const range = (start, end, step = 1): number[] => {
  const _end = end || start;
  const _start = end ? start : 0;
  const _step = step;
  return Array((_end - _start) / _step)
    .fill(0)
    .map((_, i) => _start + i * _step);
};

export function getIndexNumber(url) {
  if (url) {
    // const numbers = range(0, 4)
    const numberFromHash = Math.abs(String(url).hashCode()) % 4;

    return numberFromHash + 1;
  }
}

export const generatePagination = ({ token = '', total = 0, page = 1, last = 0 }, perPage: PerPage) => {
  const MAX_BLOCK_SIZE = 5;

  const totalPage = Math.floor(total / perPage);
  const allPages: number = total % perPage !== 0 || total === 0 ? totalPage + 1 : totalPage;

  const totalBlock = Math.floor((allPages - 1) / MAX_BLOCK_SIZE + 1);
  const currentBlock = Math.floor((page - 1) / MAX_BLOCK_SIZE + 1);

  let pages: number[] = [];
  let pre = 0;
  let next = 0;

  let hasPre = false;
  let hasNext = false;

  if (currentBlock > 1) {
    hasPre = true;
    pre = (currentBlock - 1) * MAX_BLOCK_SIZE;
  }

  if (currentBlock < totalBlock) {
    hasNext = true;
    next = currentBlock * MAX_BLOCK_SIZE + 1;

    pages = range(Math.floor((currentBlock - 1) * MAX_BLOCK_SIZE + 1), Math.floor(currentBlock * MAX_BLOCK_SIZE) + 1);
  } else if (currentBlock === totalBlock) {
    pages = range(Math.floor((currentBlock - 1) * MAX_BLOCK_SIZE + 1), allPages + 1);
  }

  if (pages.length === 0) {
    pages = [1];
  }

  const pagination = {
    pages,
    pre,
    hasPre,
    hasNext,
    page,
    next,
    token,
    last,
    total,
    block: currentBlock,
    totalBlock,
    first: 1,
  };

  return pagination;
};

export const uuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0; // Nachkommastellen abschneiden
    const value = char === 'x' ? random : (random % 4) + 8; // Bei x Random 0-15 (0-F), bei y Random 0-3 + 8 = 8-11 (8-b) gemäss RFC 4122
    return value.toString(16); // Hexadezimales Zeichen zurückgeben
  });
};
export const getDimension = () => {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e!.clientWidth || g.clientWidth,
    y = w.innerHeight || e!.clientHeight || g.clientHeight;

  return {
    x,
    y,
  };
};

/** @deprecated use `snakeCaseKeys` function instead. */
export const convertToJSONObject = (original) => {
  return mapKeys(original, (_, k: string) => snakeCase(k));
};

export const triggerGAEvent = (options: {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
}) => {
  const { category, action, label, value, nonInteraction = false } = options;

  window.ga?.('send', 'event', {
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    eventValue: value,
    nonInteraction,
  });

  window.ga?.('sendbirdShared.send', 'event', {
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    eventValue: value,
    nonInteraction,
  });
};

export const getYear = () => {
  return moment().utc().year();
};

export const renderTimestring = (seconds: number | string, ko?: boolean) => {
  const givenSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
  const isNegative = givenSeconds < 0;
  const duration = moment.duration(Math.abs(givenSeconds), 'seconds');

  const durationComponents = [
    { value: Math.floor(duration.asHours()), unit: ko ? '시간' : 'h' },
    { value: duration.minutes(), unit: ko ? '분' : 'm' },
    { value: duration.seconds(), unit: ko ? '초' : 's' },
  ];
  return (
    durationComponents
      .filter(({ value }) => value !== 0)
      .map(({ unit, value }) => `${value}${unit}`)
      .map(isNegative ? (v) => `-${v}` : (v) => v)
      .join(' ') || '0s'
  );
};

export const transformToCamelCase = (original) => {
  return mapKeys(original, (_, k) => camelCase(k.toString()));
};

export const transformToSnakeCase = (original) => {
  return mapKeys(original, (_, k) => snakeCase(k.toString()));
};

export const getUriHost = (uri) => {
  if (typeof uri !== 'string') {
    return uri;
  }
  const matches = uri.trim().match(URI_REGEX);
  return matches && matches.length > 3 ? matches[3] : uri;
};

export const isShallowEqual = (obj1, obj2) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every((key) => Object.prototype.hasOwnProperty.call(obj2, key) && obj1[key] === obj2[key]);

export function getExtension(path: string) {
  // extract file name from full path ... (supports `\\` and `/` separators)
  const basename = path.split(/[\\/]/).pop() || '';

  // get last position of `.`
  const pos = basename.lastIndexOf('.');

  if (basename === '' || pos < 1)
    // if file name is empty or ...
    return ''; //  `.` not found (-1) or comes first (0)

  return basename.slice(pos + 1); // extract extension ignoring `.`
}
export const convertNodeArrayToReactFragment = (nodeArray: readonly React.ReactNode[]) =>
  nodeArray.reduce(
    (acc, cur) => (
      <>
        {acc}
        {cur}
      </>
    ),
    null,
  );

export const isEqualIgnoreCase = (first: string, second: string) =>
  first.localeCompare(second, 'en', { sensitivity: 'base' }) === 0;

export const safeParseJSON = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

export const getClosedStatusesIndex = (closedStatus: ClosedStatus) => {
  const statuses: ClosedStatus[] = [
    'CLOSED_BY_CUSTOMER',
    'CLOSED_BY_AGENT',
    'CLOSED_BY_ADMIN',
    'CLOSED_BY_SYSTEM',
    'CLOSED_BY_PLATFORM_API',
    'CLOSED_BUT_NOT_DEFINED',
  ];
  const index = statuses.indexOf(closedStatus);
  return index >= 0 ? index : statuses.length - 1;
};

export const getDateRange = (startDate: Moment, endDate: Moment, type: unitOfTime.DurationConstructor = 'days') => {
  const diff = endDate.diff(startDate, type);
  const range: string[] = [];
  for (let i = 0; i <= diff; i++) {
    range.push(
      startDate
        .clone()
        .add(i, type)
        .format(type === 'days' ? 'YYYY-MM-DD' : 'YYYY-MM'),
    );
  }
  return range;
};

export const getTransformedUsage = (value: number, rounder = Math.floor, mantissa: number = 2) => {
  try {
    return Number.isInteger(value)
      ? numbro(value).format({ thousandSeparated: true, mantissa: 0 })
      : numbro(value).format({
          thousandSeparated: true,
          mantissa,
          roundingFunction: rounder,
        } as any);
  } catch (error) {
    logException({ error });
    return '0';
  }
};

export const transformBytesToGigaByte = (value) => {
  return value / BYTES_PER_GIGABYTE;
};

export const isByteUsageFeature = (featureKey: ChatFeatureName | FeaturePlanKey | FeatureUsageField | string) =>
  featureKey === 'file_storage' || featureKey === 'avg_file_storage' || featureKey === 'upload_traffic';
interface GenerateUsageData {
  (payload: {
    feature: ChatFeature;
    plan?: BillingPlanItem;
    usage: number;
    others?: number;
    skipAverageCheck?: boolean;
    usageField: FeatureUsageField;
  }): UsageData;
}

export const generateUsageData: GenerateUsageData = ({
  feature,
  plan,
  usage = 0,
  others,
  usageField,
  skipAverageCheck = false,
}) => {
  const isAverageType = AverageFeatures.includes(feature.key);

  let currentUsage = feature.trackable ? usage : 0;
  let totalUsage = feature.trackable ? usage + (others ?? 0) : 0;
  if (isAverageType && !skipAverageCheck) {
    // features pages are using average value now so skip for it (MonthlyUsageByApplications)
    currentUsage = currentUsage / moment().daysInMonth();
    totalUsage = totalUsage / moment().daysInMonth();
  }
  const quota = feature.trackable ? plan?.purchased_units ?? 0 : 0;
  const limit = feature.trackable ? plan?.hard_limit ?? 0 : 0;

  return {
    others,
    usage: currentUsage,
    quota,
    limit,
    isExceedLimit: !!plan?.enabled && feature.trackable && totalUsage >= limit,
    usageField,
    plan,
  };
};

export const parseUTMParameters = () => {
  const prefix = '_sb_';
  const utmKeys = ['utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term'];
  return utmKeys.reduce(
    (result, key) => {
      const cookieValue = window.cookies.get(`${prefix}${key}`);
      if (cookieValue) {
        result[key] = cookieValue;
      }
      return result;
    },
    {} as {
      [key: string]: string;
    },
  );
};

/**
 * Billing
 */

const cardToImage = {
  amex: 'American Express (Inverted)',
  diners: 'Diners Club (Inverted)',
  discover: 'Discover',
  mastercard: 'MasterCard (Inverted)',
  unionpay: 'Unknown',
  visa: 'Visa (Inverted)',
  jcb: 'JCB (Inverted)',
};

export const isCardImageExists = (cardInfo) => {
  return (
    Object.prototype.hasOwnProperty.call(cardInfo, 'brand') &&
    CardBrands.includes(cardInfo.brand) &&
    cardInfo.brand.toLowerCase() !== 'unknown'
  );
};

export const getCardImage = (brand) => {
  if (CardBrandsNew.includes(brand)) {
    return `${CLOUD_FRONT_URL}/credits/${cardToImage[brand]}.png`;
  }
  return `${CLOUD_FRONT_URL}/credits/${brand === 'Discover' ? brand : `${brand} (Inverted)`}.png`;
};

/**
 * this will give nice padding into contact input
 * @param code
 */
export const getCountryCodeWidth = (code: number) => {
  switch (code.toString().length) {
    case 1:
      return 16 + 17.67 + 7;
    case 2:
      return 16 + 26.11 + 8;
    case 3:
      return 16 + 34.55 + 8;
    default:
      return 51;
  }
};

export const getField = (usageField) =>
  usageField === 'message_search_query' || usageField === 'message_search_index' ? `${usageField}_total` : usageField;
