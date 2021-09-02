import { FC, useMemo, useRef, useEffect, createContext, useContext } from 'react';
import { useIntl } from 'react-intl';

import { toast } from 'feather';
import isEmpty from 'lodash/isEmpty';

import { SubscriptionProduct, OrganizationStatus } from '@constants';
import { useAuthorization, useTypedSelector, useCurrentSubscription, useIsCallsActivatedOrganization } from '@hooks';

const CurrentChatSubscriptionContext = createContext<{
  isLoading: boolean;
  isLoaded: boolean;
  currentSubscription: Subscription | null;
  isFreeTrialMissing: boolean;
  reload: () => void;
}>({ isLoading: false, currentSubscription: null, isLoaded: false, isFreeTrialMissing: false, reload: () => {} });

export const CurrentChatSubscriptionProvider: FC = ({ children }) => {
  const intl = useIntl();
  const { isSelfService } = useAuthorization();
  const isOrganizationEmpty = useTypedSelector((state) => isEmpty(state.organizations.current));
  const isOrganizationDeactivated = useTypedSelector((state) => {
    const organization = state.organizations.current;
    return !isEmpty(organization) && organization && organization.status !== OrganizationStatus.Active;
  });
  const isCallsActivated = useIsCallsActivatedOrganization();
  const {
    isLoading: isLoadingChatSubscription,
    currentSubscription: currentChatSubscription,
    isLoaded,
    reload,
  } = useCurrentSubscription(SubscriptionProduct.Chat);
  const reloadRef = useRef(reload);

  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  const isLoading = isOrganizationEmpty || !isLoaded || isLoadingChatSubscription;

  /**
   * Chat subscription can be null when either
   * 1) Organization has been deactivated or,
   * 2) Calls has been activated.
   *
   * Otherwise, a chat subscription must exist.
   */
  const isFreeTrialMissing =
    !isLoading && isSelfService && currentChatSubscription == null && !isCallsActivated && !isOrganizationDeactivated;

  useEffect(() => {
    if (isFreeTrialMissing) {
      toast.warning({ message: intl.formatMessage({ id: 'common.noPlanError.toastErrorMessage' }) });
    }
  }, [intl, isFreeTrialMissing]);

  return (
    <CurrentChatSubscriptionContext.Provider
      value={useMemo(
        () => ({
          isLoading,
          isLoaded,
          currentSubscription: currentChatSubscription,
          isFreeTrialMissing,
          reload: reloadRef.current,
        }),
        [isLoading, isLoaded, currentChatSubscription, isFreeTrialMissing],
      )}
    >
      {children}
    </CurrentChatSubscriptionContext.Provider>
  );
};

export const useCurrentChatSubscription = () => {
  const { isSelfService } = useAuthorization();
  const { isLoading: isLoadingPlan, isLoaded, currentSubscription, isFreeTrialMissing, ...rest } = useContext(
    CurrentChatSubscriptionContext,
  );

  const isLoading = isSelfService ? isLoadingPlan : false;

  return { isLoading, isLoaded, isSelfService, currentSubscription, isFreeTrialMissing, ...rest };
};
