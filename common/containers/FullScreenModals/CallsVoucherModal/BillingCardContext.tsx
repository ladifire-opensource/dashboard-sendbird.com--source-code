import { createContext, FC } from 'react';

import * as commonApi from '@common/api';
import { useAsync, useOrganization } from '@hooks';

const useBillingCardProvider = () => {
  const { uid } = useOrganization();
  const [{ status, error, data }, fetch] = useAsync(() => commonApi.fetchCardInfo({ organization_uid: uid }), [uid]);

  const loading = status === 'loading';
  const response = data?.data;

  return [{ loading, error, response }, fetch] as const;
};

type ContextValue = ReturnType<typeof useBillingCardProvider>;

export const BillingCardContext = createContext<ContextValue | undefined>(undefined);

export const BillingCardProvider: FC = ({ children }) => (
  <BillingCardContext.Provider value={useBillingCardProvider()}>{children}</BillingCardContext.Provider>
);
