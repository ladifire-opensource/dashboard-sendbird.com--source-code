import qs from 'qs';

import { allChannelTypes } from '.';

/**
 * @deprecated useQueryString will support 'array' params
 */
export const getChannelTypesQueryString = (channelTypes: TicketChannelType[]) => {
  const queryString = qs.stringify({ x: channelTypes }, { arrayFormat: 'comma' });
  return queryString.slice(queryString.indexOf('=') + 1);
};

export const parseChannelTypesQuery = (query: string): TicketChannelType[] => {
  const tempKey = 'x'; // can declare any string value
  const result = qs.parse(`${tempKey}=${query}`, { comma: true })[tempKey];

  if (typeof result === 'object' && Array.isArray(result)) {
    return result;
  }

  if (typeof result === 'string') {
    return result
      .split(',')
      .filter((value): value is TicketChannelType => allChannelTypes.includes(value as TicketChannelType));
  }

  return [];
};

export const getChannelTypesArray = (raw: string | string[] | undefined): TicketChannelType[] => {
  if (typeof raw === 'string') return [raw] as TicketChannelType[];
  if (Array.isArray(raw)) return raw as TicketChannelType[];
  return [] as TicketChannelType[];
};
