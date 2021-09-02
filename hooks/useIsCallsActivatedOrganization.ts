import { useSelector } from 'react-redux';

/* returns whether Calls is activated in the current organization. */
export const useIsCallsActivatedOrganization = () => {
  const isCallsActivatedOrganization = useSelector((state: RootState) => state.organizations.current.is_calls_enabled);
  return isCallsActivatedOrganization;
};
