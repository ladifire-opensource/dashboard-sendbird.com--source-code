import { useSelector } from 'react-redux';

export const useIsCallsStopped = () => {
  const { is_calls_enabled, has_calls_credit = true } = useSelector((state: RootState) => state.organizations.current);
  return is_calls_enabled && !has_calls_credit;
};
