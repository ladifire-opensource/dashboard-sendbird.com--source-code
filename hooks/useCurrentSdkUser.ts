import { useShallowEqualSelector } from './useTypedSelector';

export const useCurrentSdkUser = () => {
  return useShallowEqualSelector((state) => {
    const { sdkUser, isFetched } = state.moderations;
    return { sdkUser, isFetched };
  });
};
