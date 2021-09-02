import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ActionCreator, ActionCreatorWithPayload } from '@actions';

export const useDispatchAction = <
  A extends Function,
  T extends string,
  P,
  R = A extends ActionCreator<T> ? () => void : A extends ActionCreatorWithPayload<T, P> ? (payload: P) => void : never
>(
  actionCreator: A,
): R => {
  const dispatch = useDispatch();

  return (useCallback(
    (payload: P) => {
      dispatch(actionCreator(payload));
    },
    [actionCreator, dispatch],
  ) as unknown) as R;
};
