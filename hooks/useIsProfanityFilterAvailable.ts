import { useAuthorization } from './useAuthorization';

export const useIsProfanityFilterAvailable = () => {
  const { isFeatureEnabled, isSelfService } = useAuthorization();
  return !isSelfService || isFeatureEnabled('profanity_filter');
};
