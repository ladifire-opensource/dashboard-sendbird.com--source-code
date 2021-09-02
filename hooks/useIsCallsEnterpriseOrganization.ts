import { useOrganization } from './useOrganization';

export const useIsCallsEnterpriseOrganization = () => {
  const { voucher_type } = useOrganization();
  return voucher_type === 'SALES_CUSTOM';
};
