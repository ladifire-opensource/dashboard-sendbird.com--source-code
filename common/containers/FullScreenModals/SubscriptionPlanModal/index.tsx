import { FC, MouseEventHandler, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { cssVariables, Button, Icon } from 'feather';
import { Location } from 'history';

import { SubscriptionInfoContext } from '@/SubscriptionInfoContext';
import { commonActions } from '@actions';
import { SubscriptionName, SubscriptionProduct } from '@constants';
import useAuthentication from '@hooks/useAuthentication';
import { FullScreenModal } from '@ui/components/FullScreenModal';
import FullScreenModalHeader from '@ui/components/FullScreenModal/components/FullScreenModalHeader';

import { FeaturesTable } from './FeaturesTable';
import PricingTable from './PricingTable';
import SubscriptionPlanUpdater from './SubscriptionPlanUpdater';
import FloatingPlanHeader from './components/FloatingPlanHeader';
import VerticalScrollTrigger from './components/VerticalScrollTrigger';
import { useSubscriptionPlans } from './hooks';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 1024px;
  margin: 0 auto;
`;

const SubscriptionPlanModal: FC = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory<{ background: Location; goBackTo?: string }>();

  const { isOrganizationDeactivated } = useAuthentication();
  const { isLoading: isLoadingSubscription, isLoaded: isSubscriptionLoaded, subscriptions } = useContext(
    SubscriptionInfoContext,
  );
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  const { isFetching: isFetchingSubscriptionPlans, plans, planA1kAvailable } = useSubscriptionPlans();

  const { uid, cardInfo } = useSelector((state: RootState) => ({
    uid: state.organizations.current.uid,
    cardInfo: state.billing.cardInfo,
  }));
  const { current, future } = subscriptions[SubscriptionProduct.Chat];
  const isSalesCustom = current && current.subscription_type === 'SALES_CUSTOM';
  const [isSubscriptionFetched, setIsSubscriptionFetched] = useState(false);

  const [is1kInterested, setIs1kInterested] = useState(false);
  const isCurrentPlanStarter1K = current?.subscription_name === SubscriptionName.PlanA1K;
  const isFuturePlanStarter1K = future?.subscription_name === SubscriptionName.PlanA1K;
  // if the user, available for starter 1k plan, is using starter 1K plan or has clicked `I'm interested` already.
  const showStarter1kOption = planA1kAvailable && (is1kInterested || isCurrentPlanStarter1K || isFuturePlanStarter1K);

  const handleMoveToTopButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    modalContainerRef.current?.scrollTo(0, 0);
  };

  const handleCloseModalButtonClick = useCallback(() => {
    if (isOrganizationDeactivated) {
      history.push('/deactivated');
      return;
    }

    if (history.location.state?.goBackTo) {
      history.push(history.location.state.goBackTo);
      return;
    }

    if (history.location.state?.background) {
      history.push(history.location.state.background.pathname);
      return;
    }

    history.push('/settings/general');
  }, [history, isOrganizationDeactivated]);

  useEffect(() => {
    if (isSubscriptionLoaded) {
      setIsSubscriptionFetched(true);
    }
  }, [isSubscriptionLoaded]);

  useEffect(() => {
    if (uid) {
      dispatch(commonActions.fetchCardInfoRequest({ organization_uid: uid }));
    }
  }, [dispatch, uid]);

  if (isSalesCustom) {
    return <Redirect to="/settings/general" />;
  }

  return (
    <FullScreenModal
      id="SubscriptionPlanModal"
      ref={modalContainerRef}
      isLoading={isFetchingSubscriptionPlans || isLoadingSubscription}
      aria-labelledby="SubscriptionPlanModalTitle"
      aria-describedby="SubscriptionPlanModalDescription"
      onClose={handleCloseModalButtonClick}
    >
      {!isFetchingSubscriptionPlans && isSubscriptionFetched && (
        <VerticalScrollTrigger verticalOffset={44}>
          {({ isScrollPassed, currentKey }) => (
            <>
              <FloatingPlanHeader
                isVisible={!!isScrollPassed && Object.keys(isScrollPassed).some((key) => isScrollPassed[key].isPassed)}
                currentKey={currentKey}
                onCloseModalClick={handleCloseModalButtonClick}
              />
              <FullScreenModalHeader>
                <FullScreenModalHeader.Title id="SubscriptionPlanModalTitle" data-trigger="subscriptionPlanModalTitle">
                  {intl.formatMessage({ id: 'common.subscriptionPlanDialog.title' })}
                </FullScreenModalHeader.Title>
                <FullScreenModalHeader.Subtitle id="SubscriptionPlanModalDescription">
                  {intl.formatMessage({ id: 'common.subscriptionPlanDialog.subTitle' })}
                </FullScreenModalHeader.Subtitle>
              </FullScreenModalHeader>
              <SubscriptionPlanUpdater
                currentSubscription={current}
                futureSubscription={future}
                plans={plans}
                cardInfo={cardInfo}
                setIs1kInterested={setIs1kInterested}
                planA1kAvailable={planA1kAvailable}
                showStarter1kOption={showStarter1kOption}
              />
              <PricingTable plans={plans} showStarter1kOption={showStarter1kOption} />
              <FeaturesTable showStarter1kOption={showStarter1kOption} />
              <Container>
                <Button
                  buttonType="secondary"
                  variant="ghost"
                  css="margin-top: 32px;"
                  onClick={handleMoveToTopButtonClick}
                >
                  {intl.formatMessage({ id: 'common.subscriptionPlanDialog.button.scrollToTop' })}
                  <Icon icon="arrow-up" size={20} color={cssVariables('neutral-9')} css="margin-left: 4px;" />
                </Button>
              </Container>
            </>
          )}
        </VerticalScrollTrigger>
      )}
    </FullScreenModal>
  );
};

export default SubscriptionPlanModal;
