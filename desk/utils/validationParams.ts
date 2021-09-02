import moment from 'moment-timezone';

import { ISO_DATE_FORMAT_REGEX, ISO_DATE_FORMAT, DEFAULT_PAGE_SIZE_OPTIONS, SortOrder } from '@constants';
import { ALL_EXPORT_TYPE_VALUES } from '@desk/containers/dataExport/constants';
import { QueryParamValue } from '@hooks/useQueryString';
import { allChannelTypes } from '@ui/components/TicketChannelTypesFilter';

export const validatePage = (page: QueryParamValue) => {
  const pageNumber = Number(page);
  return Number.isInteger(pageNumber) && pageNumber > 0;
};

export const validatePageSize = (pageSize: QueryParamValue) => {
  const pageSizeNumber = Number(pageSize);
  return (
    Number.isInteger(pageSizeNumber) &&
    pageSizeNumber > 0 &&
    DEFAULT_PAGE_SIZE_OPTIONS.includes(pageSizeNumber as PerPage)
  );
};

export const validateStartDate = (startDate: QueryParamValue, endDate?: QueryParamValue) => {
  if (!startDate || !endDate || Array.isArray(startDate) || Array.isArray(endDate)) {
    return false;
  }

  if (startDate) {
    const isValidFormat = ISO_DATE_FORMAT_REGEX.test(startDate);
    const startMoment = moment(startDate, ISO_DATE_FORMAT);
    const endMoment = moment(endDate, ISO_DATE_FORMAT);
    const isValidMoment = startMoment.isValid();
    const isBeforeFromEnd = startMoment.isSameOrBefore(endMoment);

    if (!isValidFormat || !isValidMoment || !isBeforeFromEnd) {
      return false;
    }
  }

  return true;
};

export const validateEndDate = (endDate: QueryParamValue, startDate?: QueryParamValue) => {
  if (!endDate || !startDate || Array.isArray(startDate) || Array.isArray(endDate)) {
    return false;
  }

  if (endDate) {
    const isValidFormat = ISO_DATE_FORMAT_REGEX.test(endDate);
    const startMoment = moment(startDate, ISO_DATE_FORMAT);
    const endMoment = moment(endDate, ISO_DATE_FORMAT);
    const isValidMoment = endMoment.isValid();
    const isAfterFromStart = endMoment.isSameOrAfter(startMoment);

    if (!isValidFormat || !isValidMoment || !isAfterFromStart) {
      return false;
    }
  }

  return true;
};

export const validateChannelTypes = (query: QueryParamValue) => {
  if (typeof query === 'string') {
    return allChannelTypes.includes(query as TicketChannelType);
  }
  if (query && Array.isArray(query)) {
    return query.every((channel) => allChannelTypes.includes(channel as TicketChannelType));
  }
  return false;
};

export const validateSortBy = (sortableKeys: string[], sortBy: QueryParamValue) => {
  if (sortBy && !Array.isArray(sortBy)) {
    const isValid = sortableKeys.includes(sortBy);
    return isValid;
  }
  return false;
};

export const validateSortOrder = (sortOrder: QueryParamValue) => {
  if (sortOrder) {
    const orders = Object.values(SortOrder);
    const isValid = orders.includes(sortOrder as SortOrder);
    return isValid;
  }
  return false;
};

export const validateDate = (statusDate: QueryParamValue) => {
  if (statusDate && !Array.isArray(statusDate)) {
    const isValidFormat = ISO_DATE_FORMAT_REGEX.test(statusDate);
    const isValidMoment = moment(statusDate, ISO_DATE_FORMAT).isValid();
    return isValidFormat && isValidMoment;
  }
  return false;
};

export const validateDataType = (types: QueryParamValue) => {
  if (types === undefined) return true;
  if (typeof types === 'string') {
    return ALL_EXPORT_TYPE_VALUES.includes(types);
  }
  if (Array.isArray(types)) {
    const isValidValue = types.every((type) => ALL_EXPORT_TYPE_VALUES.includes(type));
    return isValidValue;
  }
  return false;
};
