import { useEffect } from 'react';

import { SubscriptionProduct } from '@constants';
import { useCurrentSubscription, useAuthorization } from '@hooks';

export const useTechnicalIssueSubmissionAvailability = () => {
  const { isSelfService } = useAuthorization();
  const { currentSubscription: supportSubscription, reload, isLoading } = useCurrentSubscription(
    SubscriptionProduct.Support,
  );

  useEffect(() => {
    reload();
  }, [reload]);

  if (isLoading) {
    return { isAvailable: undefined, isLoading };
  }
  return { isAvailable: isSelfService ? !!supportSubscription : true, isLoading };
};
