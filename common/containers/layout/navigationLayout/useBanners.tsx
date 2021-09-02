import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import isEmpty from 'lodash/isEmpty';
import moment from 'moment-timezone';

import { useCurrentChatSubscription } from '@common/containers/CurrentChatSubscriptionProvider';
import { FULL_MONTH_DATE_FORMAT, OrganizationStatus } from '@constants';
import { useAuthorization, useShallowEqualSelector } from '@hooks';
import { useInvoices } from '@hooks/useInvoices';
import { Banner, BannerStatus } from '@ui/components/Banner';

import { EmailVerificationBanner } from './emailVerificationBanner';

export const useBanners = () => {
  const intl = useIntl();
  const history = useHistory();
  const { newEmail, emailVerified, isSSO, isFetching, authenticated, organization } = useShallowEqualSelector(
    (state: RootState) => ({
      newEmail: state.auth.user.new_email,
      emailVerified: state.auth.user.email_verified,
      isSSO: state.auth.is_social || state.auth.is_sso,
      isFetching: state.auth.isFetching,
      authenticated: state.auth.authenticated,
      organization: state.organizations.current,
    }),
  );
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const pendingAnimationFunctionRef = useRef<(() => void) | null>(null);
  const [isAnimationPending, setIsAnimationPending] = useState(false);
  const { isSelfService } = useAuthorization();
  const { isLoading: isLoadingSubscription, currentSubscription } = useCurrentChatSubscription();

  const isFreeTrial = currentSubscription?.subscription_name === 'free_trial';
  const subscriptionEndDate = currentSubscription?.end_date;

  const invoices = useInvoices({ limit: 20, offset: 0, status: 'FAILED' });
  const isLoadingInvoices = invoices.isLoading;

  const failedInvoiceCount = invoices.data?.count ?? 0;
  const isOrganizationDeactivated = !isEmpty(organization) && organization?.status !== OrganizationStatus.Active;

  const banners = useMemo(() => {
    const bannerComponents: React.ReactNode[] = [];
    if (isSelfService) {
      if (isFreeTrial && !isOrganizationDeactivated && moment(subscriptionEndDate).isAfter(moment())) {
        if (moment(subscriptionEndDate).diff(moment(), 'days') <= 1) {
          bannerComponents.push(
            <Banner
              key="FreeTrialExpiresDay"
              status={BannerStatus.Error}
              content={intl.formatMessage({ id: 'common.banner.freeTrialExpires.1day' })}
              action={{
                type: 'button',
                label: intl.formatMessage({ id: 'common.banner.button.goToGeneral' }),
                onClick: () => {
                  history.push('/settings/general');
                },
              }}
            />,
          );
        } else if (moment(subscriptionEndDate).diff(moment(), 'days') <= 7) {
          bannerComponents.push(
            <Banner
              key="FreeTrialExpiresWeek"
              status={BannerStatus.Warning}
              content={intl.formatMessage(
                { id: 'common.banner.freeTrialExpires.7day' },
                {
                  expiresAt: moment(subscriptionEndDate).format(FULL_MONTH_DATE_FORMAT),
                },
              )}
              action={{
                type: 'button',
                label: intl.formatMessage({ id: 'common.banner.button.goToGeneral' }),
                onClick: () => {
                  history.push('/settings/general');
                },
              }}
            />,
          );
        }
      }
      if (failedInvoiceCount > 0) {
        bannerComponents.push(
          <Banner
            key="PaymentFail"
            status={BannerStatus.Error}
            content={intl.formatMessage(
              { id: 'common.banner.paymentFail' },
              {
                date: moment(subscriptionEndDate).format(FULL_MONTH_DATE_FORMAT),
              },
            )}
            action={{
              type: 'button',
              label: intl.formatMessage({ id: 'common.banner.button.goToBilling' }),
              onClick: () => {
                history.push('/settings/billing');
              },
            }}
          />,
        );
      }
    }
    if (!emailVerified || newEmail !== '') {
      bannerComponents.push(<EmailVerificationBanner key="EmailVerification" />);
    }
    return bannerComponents;
  }, [
    emailVerified,
    newEmail,
    isSelfService,
    isFreeTrial,
    isOrganizationDeactivated,
    subscriptionEndDate,
    failedInvoiceCount,
    intl,
    history,
  ]);

  useEffect(() => {
    if (!authenticated) {
      setIsBannerVisible(false);
      return;
    }

    if (isSSO) {
      setIsBannerVisible(false);
      return;
    }

    if (newEmail) {
      pendingAnimationFunctionRef.current = () => {
        setTimeout(() => {
          setIsBannerVisible(true);
          setTimeout(() => {
            setIsBannerVisible(false);
          }, 5000);
        }, 0);
      };
      setIsAnimationPending(true);
      return;
    }

    if (!emailVerified) {
      pendingAnimationFunctionRef.current = () => {
        setTimeout(() => {
          setIsBannerVisible(true);
        }, 0);
      };
      setIsAnimationPending(true);
      return;
    }

    setIsBannerVisible(false);
  }, [authenticated, isSSO, newEmail, emailVerified]);

  useEffect(() => {
    if (!isFetching && isAnimationPending) {
      setIsAnimationPending(false);
      pendingAnimationFunctionRef.current && pendingAnimationFunctionRef.current();
    }
  }, [isAnimationPending, isFetching]);

  const loading = !authenticated || isFetching || isLoadingSubscription || isLoadingInvoices;

  return {
    loading,
    isBannerVisible,
    banners,
  };
};
