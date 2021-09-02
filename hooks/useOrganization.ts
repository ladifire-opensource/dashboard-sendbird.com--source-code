import { useSelector } from 'react-redux';

export const useOrganization = () => useSelector((state: RootState) => state.organizations.current);
