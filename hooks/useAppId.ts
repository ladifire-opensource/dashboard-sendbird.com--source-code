import { useTypedSelector } from './useTypedSelector';

export const useAppId = () => {
  const appId = useTypedSelector((state) => state.applicationState.data?.app_id);
  return appId || '';
};
