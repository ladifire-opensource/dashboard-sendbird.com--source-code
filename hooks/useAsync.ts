import { DependencyList, useState, useCallback, useRef } from 'react';

type State<T> =
  | { status: 'init'; error?: undefined; data?: undefined }
  | { status: 'loading'; error?: any; data?: T }
  | { status: 'error'; error: any; data?: undefined }
  | { status: 'success'; error?: undefined; data: T };

type AsyncFn<Result = any, Args extends any[] = any[]> = [State<Result>, (...args: Args) => Promise<Result>];

/**
 * @returns [{ status: 'init' | 'loading' | 'error' | 'success', error, data }, callback]
 */
export const useAsync = <Result = any, Args extends any[] = any[]>(
  fn: (...args: Args) => Promise<Result>,
  deps: DependencyList,
  initialState: State<Result> = { status: 'init' },
): AsyncFn<Result, Args> => {
  const lastCallId = useRef(0);
  const [state, set] = useState<State<Result>>(initialState);

  const callback = useCallback((...args: Args) => {
    const callId = ++lastCallId.current;
    set((state) => ({ ...state, status: 'loading' }));

    return fn(...args).then(
      (data) => {
        callId === lastCallId.current && set({ data, status: 'success' });
        return data;
      },
      (error) => {
        callId === lastCallId.current && set({ error, status: 'error' });
        return error;
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [state, callback];
};
