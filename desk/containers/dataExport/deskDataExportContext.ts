import { Dispatch, useReducer, useMemo, createContext, useCallback } from 'react';
import { useIntl } from 'react-intl';

import { toast, DateRangePickerValue } from 'feather';
import moment from 'moment-timezone';

import { LIST_LIMIT, ISO_DATE_FORMAT, DeskDataExportRequestType, DeskDataExportStatus, SortOrder } from '@constants';
import { fetchDataExports as fetchDataExportsRequest, getDownloadURL as getDownloadURLRequest } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import {
  validateDataType,
  validatePage,
  validatePageSize,
  validateStartDate,
  validateEndDate,
} from '@desk/utils/validationParams';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { useQueryString, QueryParamsWithUpdate } from '@hooks/useQueryString';
import { getSorterParams } from '@utils';
import { convertDateRangePickerValueToDateRange } from '@utils/convertDateRangePickerValueToDateRange';

import { STATUS_LIST, DeskDataExportSortBy } from './constants';

type Action = { [P in keyof State]?: State[P] };

type DeskDataExportContext = {
  state: State;
  setState: Dispatch<Action>;
  fetchDataExports: () => void;
  getDownloadURL: (id: DeskDataExport['id']) => void;
  searchParams: QueryParamsWithUpdate<SearchParams>;
  isFiltered: boolean;
};

type State = {
  isFetching: boolean;
  dataExports: DeskDataExport[];
  exportsCount: number;
};

type SearchParams = {
  page: number;
  pageSize: PerPage;
  sortBy: DeskDataExportSortBy;
  order: SortOrder;
} & FilterParams;

type FilterParams = {
  dataType?: DeskDataExportRequestType[];
  status?: DeskDataExportStatus;
  dateRangeValue?: DateRangePickerValue;
  startDate?: string;
  endDate?: string;
};

const initFilterParams: FilterParams = {
  dataType: undefined,
  status: undefined,
  dateRangeValue: DateRangePickerValue.AllDates,
  startDate: undefined,
  endDate: undefined,
};

export const initSearchParams: SearchParams = {
  page: 1,
  pageSize: LIST_LIMIT,
  sortBy: DeskDataExportSortBy.CREATED_AT,
  order: SortOrder.DESCEND,
  ...initFilterParams,
};

export const initState: State = {
  isFetching: false,
  dataExports: [],
  exportsCount: 0,
};

export const deskDataExportContextValue: DeskDataExportContext = {
  state: initState,
  setState: () => {},
  fetchDataExports: () => {},
  getDownloadURL: () => {},
  isFiltered: false,
  searchParams: { ...initSearchParams, updateParams: () => {}, clearParams: () => {} },
};

const reducer: Reducer<State, Action> = (prevState, updatedProperty) => ({
  ...prevState,
  ...updatedProperty,
});

const STATUS_VALUES = STATUS_LIST.map((item) => item.value);

export const useDeskDataExportContext: ContainerContextHook<DeskDataExportContext, State> = (injectInitState) => {
  const intl = useIntl();
  const searchParams = useQueryString<SearchParams>(initSearchParams, {
    page: (page) => validatePage(page),
    pageSize: (pageSize) => validatePageSize(pageSize),
    dataType: (types) => validateDataType(types),
    dateRangeValue: (value, params) => {
      const isValidRangeValue = [
        DateRangePickerValue.Today,
        DateRangePickerValue.Yesterday,
        DateRangePickerValue.Last7Days,
        DateRangePickerValue.Last14Days,
        DateRangePickerValue.Last30Days,
        DateRangePickerValue.Last90Days,
        DateRangePickerValue.Custom,
        DateRangePickerValue.AllDates,
      ].some((item) => item === value);

      if (!isValidRangeValue) {
        return false;
      }

      if (value === DateRangePickerValue.Custom && (!params.startDate || !params.endDate)) {
        return false;
      }
      return true;
    },
    startDate: (startDate, params) => {
      const noCustomDateRange = params.dateRangeValue !== DateRangePickerValue.Custom;

      if (!startDate || noCustomDateRange) {
        return false;
      }

      return validateStartDate(startDate, params.endDate);
    },
    endDate: (endDate, params) => {
      const noCustomDateRange = params.dateRangeValue !== DateRangePickerValue.Custom;

      if (!endDate || noCustomDateRange) {
        return false;
      }

      return validateEndDate(endDate, params.startDate);
    },
    status: (status) => {
      if (status) {
        const isValidValue = STATUS_VALUES.some((item) => item === status);
        return isValidValue;
      }
      return true;
    },
    sortBy: (sortBy) => {
      if (sortBy) {
        const sortableKeys = [DeskDataExportSortBy.CREATED_AT, DeskDataExportSortBy.EXPIRED_AT];
        const isValid = sortableKeys.some((key) => key === sortBy);
        return isValid;
      }
      return false;
    },
    order: (order) => {
      if (order) {
        const orders = [SortOrder.ASCEND, SortOrder.DESCEND];
        const isValid = orders.some((item) => item === order);
        return isValid;
      }
      return false;
    },
  });

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [state, setState] = useReducer(reducer, { ...initState, ...injectInitState });
  const {
    page,
    pageSize,
    // set the fallback value of dataType and status null to prevent fetchDataExports from being redefined when they become undefined.
    dataType = null,
    status = null,
    startDate,
    endDate,
    sortBy,
    order,
    dateRangeValue,
  } = searchParams;

  const dataTypeArray: DeskDataExportRequestType[] = useMemo(() => {
    if (typeof dataType === 'string') {
      return [dataType];
    }
    if (Array.isArray(dataType)) {
      return dataType;
    }
    return [];
  }, [dataType]);

  const fetchDataExports = useCallback(async () => {
    try {
      setState({ isFetching: true });
      let dateRange = { startDate, endDate };
      if (dateRangeValue !== DateRangePickerValue.Custom) {
        const rangeMoments = convertDateRangePickerValueToDateRange(dateRangeValue || DateRangePickerValue.AllDates);
        if (rangeMoments) {
          dateRange = {
            startDate: rangeMoments.startDate.format(ISO_DATE_FORMAT),
            endDate: rangeMoments.endDate.format(ISO_DATE_FORMAT),
          };
        }
      }
      const result = await fetchDataExportsRequest(pid, region, {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        requestType: dataTypeArray ?? undefined,
        status: status ?? undefined,
        startDate: dateRange?.startDate ?? undefined,
        endDate: dateRange?.endDate ?? undefined,
        order: getSorterParams(sortBy, order),
      });

      setState({
        dataExports: result.data.results.map((item) => {
          if (item.expiredAt && moment(item.expiredAt).isBefore(moment())) {
            return {
              ...item,
              status: DeskDataExportStatus.EXPIRED,
            };
          }
          return item;
        }),
        isFetching: false,
        exportsCount: result.data.count,
      });
    } catch (err) {
      setState({ isFetching: false });
      toast.error({ message: getErrorMessage(err) });
    }
  }, [
    startDate,
    endDate,
    dateRangeValue,
    pid,
    region,
    pageSize,
    page,
    dataTypeArray,
    status,
    sortBy,
    order,
    getErrorMessage,
  ]);

  const getDownloadURL = useCallback(
    async (id: DeskDataExport['id']) => {
      try {
        const { data } = await getDownloadURLRequest(pid, region, { id });
        // FOR IE?
        // const BOM = '\uFEFF';
        // const href = URL.createObjectURL(new Blob([BOM + data.url], { type: headers['content-type'] }));
        const temporaryLink = document.createElement('a');
        temporaryLink.setAttribute('href', data.url);
        document.body.appendChild(temporaryLink);
        temporaryLink.click();
        document.body.removeChild(temporaryLink);
        toast.success({ message: intl.formatMessage({ id: 'desk.dataExport.toast.dataExport.success' }) });
      } catch (err) {
        toast.error({ message: getErrorMessage(err) });
      }
    },
    [getErrorMessage, intl, pid, region],
  );

  const isFiltered = useMemo(() => {
    return !Object.keys(initFilterParams)
      .map((key) => (initFilterParams[key] ?? null) === (searchParams[key] ?? null))
      .every((item) => item);
  }, [searchParams]);

  return useMemo(
    () => ({
      state,
      setState,
      fetchDataExports,
      getDownloadURL,
      isFiltered,
      searchParams: { ...searchParams, dataType: dataTypeArray },
    }),
    [state, fetchDataExports, getDownloadURL, isFiltered, searchParams, dataTypeArray],
  );
};

export const DeskDataExportContext = createContext(deskDataExportContextValue);
