import { useMemo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import qs from 'qs';

import { snakeCaseKeys, camelCaseKeys } from '@utils';

import { useLatestValue } from './useLatestValue';

export type QueryParamsWithUpdate<T extends Object> = T & {
  updateParams: (updates: Partial<T>, replace?: boolean) => void;
  clearParams: (replace?: boolean) => void;
};

export const getQueryParamsFromQueryString: <T extends Object>(queryString: string, defaultParams: T) => T = <
  T extends Object
>(
  queryString = '',
  defaultParams,
) => {
  const queryMap: T = camelCaseKeys(qs.parse(queryString));
  const queryParams = Object.keys(queryMap).reduce((acc, key) => {
    if (key in defaultParams && typeof defaultParams[key] === 'number') {
      acc[key] = parseInt(queryMap[key]);
    } else {
      acc[key] = queryMap[key];
    }
    return acc;
  }, {} as T);

  return queryString ? queryParams : defaultParams;
};

export const convertQueryParamsToQueryString = <T extends Object>(value: T) => {
  const queryStringParams = snakeCaseKeys(value);

  // Delete keys with falsy values (e.g. empty strings, null, undefined)
  Object.keys(queryStringParams)
    .filter((key) => !queryStringParams[key])
    .forEach((key) => {
      delete queryStringParams[key];
    });
  return qs.stringify(queryStringParams, { arrayFormat: 'repeat' });
};

export type QueryParamValue = string | string[] | undefined;

type Validate<T> = { [key in keyof Partial<T>]: (queryString: QueryParamValue, params: T) => boolean };

export const useQueryString = <T extends Object>(
  defaultParams: T,
  validate?: Validate<T>,
): QueryParamsWithUpdate<T> => {
  const history = useHistory();
  const defaultParamsRef = useLatestValue(defaultParams);
  const validateRef = useLatestValue(validate);

  const getCurrentParams = useCallback(
    () => getQueryParamsFromQueryString<T>(history.location.search.replace(/^\?/, ''), defaultParamsRef.current),
    [defaultParamsRef, history.location.search],
  );

  const updateParams = useCallback(
    (updates: Partial<T>, replace: boolean = false) => {
      const currentParams = getCurrentParams();
      const newParams = { ...currentParams, ...camelCaseKeys(updates) };
      const currentSearch = history.location.search.replace(/^\?/, '');
      const newSearch = convertQueryParamsToQueryString(newParams);
      if (newSearch !== currentSearch) {
        if (replace) {
          history.replace(`${history.location.pathname}?${newSearch}`);
        } else {
          history.push(`${history.location.pathname}?${newSearch}`);
        }
      }
    },
    [getCurrentParams, history],
  );

  const clearParams = useCallback((replace: boolean = true) => updateParams(defaultParamsRef.current, replace), [
    defaultParamsRef,
    updateParams,
  ]);

  const params = useMemo(() => {
    const currentParams = getCurrentParams();
    if (validateRef.current) {
      const validParams = Object.keys(validateRef.current).reduce(
        (acc, key) => {
          if (
            (validateRef.current as Validate<T>)[key] &&
            !(validateRef.current as Validate<T>)[key](currentParams[key], currentParams)
          ) {
            acc[key] = defaultParamsRef.current[key];
          }
          return acc;
        },
        { ...currentParams },
      );
      updateParams(validParams, true);
      return validParams;
    }
    return currentParams;
  }, [defaultParamsRef, getCurrentParams, updateParams, validateRef]);
  return useMemo(() => ({ ...params, updateParams, clearParams }), [clearParams, params, updateParams]);
};
