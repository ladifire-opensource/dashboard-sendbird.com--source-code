import { useTypedSelector } from '@hooks';

const MESSAGE_SEARCH_AVAILABLE_REGIONS = [
  // Production
  'ap-1',
  'ap-2',
  'ap-5',
  'ap-8',
  'ap-9',
  'us-1',
  'us-2',
  'us-3',
  'eu-1',
  // Staging
  'intoz',
];
export const useIsMessageSearchAvailable = () => {
  const applicationRegion = useTypedSelector((state) => state.applicationState.data?.region);
  return MESSAGE_SEARCH_AVAILABLE_REGIONS.includes(applicationRegion || '');
};
