import { useSelector as useReduxSelector, shallowEqual } from 'react-redux';

export const useTypedSelector = <T>(selector: (state: RootState) => T, equalityFn?: (left: T, right: T) => boolean) =>
  useReduxSelector<RootState, T>(selector, equalityFn);

export const useShallowEqualSelector = <T>(selector: (state: RootState) => T) =>
  useTypedSelector(selector, shallowEqual);
