import { FC, useCallback, useContext } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  Body,
  Button,
  cssVariables,
  Headings,
  InlineNotification,
  Link,
  Lozenge,
  Subtitles,
  Typography,
} from 'feather';
import moment from 'moment-timezone';

import {
  SubscriptionStatus,
  useVoucherLoader,
  useLatestVoucher,
  useNextVoucher,
  useSubscription,
  isActivatable,
} from '@common/containers/CallsVoucherContext';
import { Info } from '@common/containers/FullScreenModals/CallsVoucherModal/components';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsGridCard } from '@common/containers/layout';
import { DEFAULT_DATE_FORMAT, FullScreenModalIDs } from '@constants';
import { useShowDialog } from '@hooks';
import { useIsCallsActivatedOrganization } from '@hooks/useIsCallsActivatedOrganization';
import { useIsCallsEnterpriseOrganization } from '@hooks/useIsCallsEnterpriseOrganization';
import { useIsCallsStopped } from '@hooks/useIsCallsStopped';
import { FullScreenModalContext } from '@ui/components/FullScreenModal/context';
import { VoucherSubscriptionStatus } from '@ui/components/VoucherSubscriptionStatus';
import { getDurationMonths } from '@utils/calls';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 24px;
`;

const ContentContainer = styled.div`
  display: grid;
  grid-gap: 8px;
`;

const Title = styled.h4`
  ${Subtitles['subtitle-02']}
  color: ${cssVariables('neutral-7')};
`;

const Description = styled.p`
  ${Body['body-short-01']}
  color: ${cssVariables('neutral-7')};
`;

const Paid = () => {
  const intl = useIntl();

  return (
    <Lozenge color="green">{intl.formatMessage({ id: 'common.settings.general.callsCredits.lozenge.paid' })}</Lozenge>
  );
};

const Unavailable: FC<{ className?: string }> = (props) => {
  const intl = useIntl();

  return (
    <Lozenge color="red" {...props}>
      {intl.formatMessage({ id: 'common.settings.general.callsCredits.lozenge.unavailable' })}
    </Lozenge>
  );
};

const Divider = styled.div`
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const useCallsVoucherModal = () => {
  const { openModal } = useContext(FullScreenModalContext);
  const openVoucherModal = useCallback(() => {
    openModal(FullScreenModalIDs.CallsVoucher);
  }, [openModal]);

  return openVoucherModal;
};

const useDisableSubscriptionDialog = () => {
  const showDialog = useShowDialog();
  return () => showDialog({ dialogTypes: DialogType.CallsDisableSubscription });
};

const NotActivated = () => {
  const intl = useIntl();

  return (
    <Container>
      <ContentContainer>
        <Title>{intl.formatMessage({ id: 'common.settings.general.callsCredits.notActivated.title' })}</Title>
        <Description>
          {intl.formatMessage({ id: 'common.settings.general.callsCredits.notActivated.description' })}
        </Description>
      </ContentContainer>
    </Container>
  );
};

const CallsCreditsContainer = styled.div`
  > ${Divider} {
    width: calc(100% + 24px);
    margin: 24px 0;
  }
`;

const VoucherSectionContainer = styled.div`
  display: grid;
  grid-template-columns: 160px max-content;
`;

const label = css`
  ${Typography['label-03']}
  color: ${cssVariables('neutral-6')};
`;

const VoucherBox = styled.div`
  display: flex;
  flex-direction: column;

  > h5 {
    ${label}
    display: flex;
    min-height: 24px;
    align-items: center;

    svg {
      fill: ${cssVariables('neutral-6')};
    }
  }

  > strong {
    ${Headings['heading-02']}
    color: ${cssVariables('neutral-10')};
    display: flex;
    align-items: center;
    margin-top: 4px;

    > ${Lozenge} {
      margin-left: 8px;
    }
  }

  > span {
    ${Body['body-short-01']}
    color: ${cssVariables('neutral-7')};
  }

  > * + * {
    margin-top: 8px;
  }
`;

const VoucherSection: FC<{
  latestVoucher: NonNullable<ReturnType<typeof useLatestVoucher>>;
  nextVoucher: ReturnType<typeof useNextVoucher>;
}> = ({ latestVoucher, nextVoucher }) => {
  const intl = useIntl();
  const { balance, expireAt } = latestVoucher;

  return (
    <VoucherSectionContainer>
      <VoucherBox>
        <h5>{intl.formatMessage({ id: 'common.settings.general.callsCredits.voucher.title' })}</h5>
        <strong data-test-id="CurrentBalance">
          {intl.formatMessage(
            { id: 'common.settings.general.callsCredits.credits' },
            { value: balance.toLocaleString() },
          )}
        </strong>
        <span data-test-id="ExpiredAt">
          {intl.formatMessage(
            { id: 'common.settings.general.callsCredits.voucher.expiredAt' },
            { at: moment(expireAt).format(DEFAULT_DATE_FORMAT) },
          )}
        </span>
      </VoucherBox>
      {nextVoucher && isActivatable(nextVoucher) && (
        <VoucherBox>
          <h5>
            {intl.formatMessage({ id: 'common.settings.general.callsCredits.voucher.nextVoucher' })}
            <Info
              tooltip={intl.formatMessage({ id: 'common.settings.general.callsCredits.voucher.nextVoucher.tooltip' })}
              style={{ maxWidth: 256 }}
            />
          </h5>
          <strong data-test-id="NextVoucher">
            {intl.formatMessage(
              { id: 'common.settings.general.callsCredits.credits' },
              { value: nextVoucher.quota.toLocaleString() },
            )}
            <Paid />
          </strong>
        </VoucherBox>
      )}
    </VoucherSectionContainer>
  );
};

const DList = styled.dl`
  display: grid;
  grid-template-rows: 24px 24px;
  grid-template-columns: 136px 1fr;
  grid-gap: 4px 24px;
  align-items: center;

  dt {
    ${label}
  }

  dd {
    ${Subtitles['subtitle-01']};
    color: ${cssVariables('neutral-7')};
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  a {
    display: inline-block;
    margin-top: 8px;
    text-align: right;
    text-decoration: underline;
    color: ${cssVariables('purple-7')};
    font-size: 14px;
  }
`;

const SubscriptionSectionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 16px 24px;

  ${InlineNotification} {
    grid-column: 1 / 3;
  }
`;

const NoSubscriptionInfo = () => {
  const intl = useIntl();

  return (
    <InlineNotification
      type="info"
      data-test-id="NoSubscriptionInfo"
      message={intl.formatMessage({ id: 'common.settings.general.callsCredits.noSubscriptionInfo' })}
    />
  );
};

const AutoPurchaseNotice = () => {
  const intl = useIntl();

  return (
    <InlineNotification
      type="info"
      data-test-id="AutoPurchaseNotice"
      message={intl.formatMessage({ id: 'common.settings.general.callsCredits.autoPurchaseNotice' })}
    />
  );
};

const PaymentDeclinedError = () => {
  const intl = useIntl();

  return (
    <InlineNotification
      type="error"
      data-test-id="PaymentDeclinedError"
      message={intl.formatMessage({ id: 'common.settings.general.callsCredits.paymentDeclinedError' })}
    />
  );
};

const UnavailableError = () => {
  const intl = useIntl();

  return (
    <InlineNotification
      type="error"
      data-test-id="UnavailableError"
      message={intl.formatMessage({ id: 'common.settings.general.callsCredits.unavailable' })}
    />
  );
};

const useContactUs = () => {
  const history = useHistory();
  return () => history.push({ pathname: '/settings/contact_us', search: '?category=pricing' });
};

type ActionButtonProps = { status: SubscriptionStatus; isCallsStopped: boolean };

const ActionButton: FC<ActionButtonProps> = ({ status, isCallsStopped }) => {
  const openVoucherModal = useCallsVoucherModal();
  const intl = useIntl();
  const text = isCallsStopped
    ? 'common.settings.general.callsCredits.subscription.action.get'
    : {
        [SubscriptionStatus.ON]: 'common.settings.general.callsCredits.subscription.action.manage',
        [SubscriptionStatus.OFF]: 'common.settings.general.callsCredits.subscription.action.enable',
        [SubscriptionStatus.PAYMENT_DECLINED]: 'common.settings.general.callsCredits.subscription.action.pay',
      }[status];

  return (
    <Button buttonType="primary" data-test-id="Action" onClick={openVoucherModal}>
      {intl.formatMessage({ id: text })}
    </Button>
  );
};

const EnterpriseActionButton: FC<ActionButtonProps> = ({ status, isCallsStopped }) => {
  const goToContactUs = useContactUs();
  const intl = useIntl();
  const text = isCallsStopped
    ? 'common.settings.general.callsCredits.subscription.action.pay.enterprise'
    : {
        [SubscriptionStatus.ON]: 'common.settings.general.callsCredits.subscription.action.manage.enterprise',
        [SubscriptionStatus.OFF]: 'common.settings.general.callsCredits.subscription.action.enable.enterprise',
        [SubscriptionStatus.PAYMENT_DECLINED]:
          'common.settings.general.callsCredits.subscription.action.pay.enterprise',
      }[status];

  return (
    <Button buttonType="primary" data-test-id="EnterpriseAction" onClick={goToContactUs}>
      {intl.formatMessage({ id: text })}
    </Button>
  );
};

const SubscriptionSection = () => {
  const intl = useIntl();
  const subscription = useSubscription();
  const nextVoucher = useNextVoucher();
  const openDisableSubscriptionDialog = useDisableSubscriptionDialog();
  const isCallsStopped = useIsCallsStopped();
  const isEnterpriseOrganization = useIsCallsEnterpriseOrganization();

  if (!subscription) return null;
  const { status, credits, durationDays } = subscription;
  const actionButtonProps = { status, isCallsStopped };

  return (
    <SubscriptionSectionContainer>
      <DList>
        <dt>{intl.formatMessage({ id: 'common.settings.general.callsCredits.subscription.title' })}</dt>
        <dd data-test-id="Status">
          <VoucherSubscriptionStatus status={status} />
        </dd>
        {credits && (
          <>
            <dt>
              {intl.formatMessage({
                id: isEnterpriseOrganization
                  ? 'common.settings.general.callsCredits.subscription.amount.enterprise'
                  : 'common.settings.general.callsCredits.subscription.amount',
              })}
            </dt>
            <dd data-test-id="Amount">
              {intl.formatMessage(
                { id: 'common.settings.general.callsCredits.credits' },
                { value: credits.toLocaleString() },
              )}
              {durationDays &&
                ` ${intl.formatMessage(
                  { id: 'common.settings.general.callsCredits.subscription.duration' },
                  { months: getDurationMonths(durationDays) },
                )}`}
            </dd>
          </>
        )}
      </DList>
      <ButtonsContainer>
        {isEnterpriseOrganization ? (
          <EnterpriseActionButton {...actionButtonProps} />
        ) : (
          <ActionButton {...actionButtonProps} />
        )}
        {credits && !isEnterpriseOrganization && (
          <Link onClick={openDisableSubscriptionDialog}>
            {intl.formatMessage({ id: 'common.settings.general.callsCredits.subscription.disableLink' })}
          </Link>
        )}
      </ButtonsContainer>
      {status === SubscriptionStatus.ON && !nextVoucher && <AutoPurchaseNotice />}
      {status === SubscriptionStatus.OFF && <NoSubscriptionInfo />}
      {status === SubscriptionStatus.PAYMENT_DECLINED && <PaymentDeclinedError />}
      {isCallsStopped && <UnavailableError />}
    </SubscriptionSectionContainer>
  );
};

export const CallsCredits = () => {
  const intl = useIntl();
  const isCallsActivatedOrganization = useIsCallsActivatedOrganization();
  const latestVoucher = useLatestVoucher();
  const nextVoucher = useNextVoucher();
  const isCallsStopped = useIsCallsStopped();
  useVoucherLoader();

  const renderContent = () => {
    if (!isCallsActivatedOrganization) {
      return <NotActivated />;
    }

    return (
      <CallsCreditsContainer>
        {latestVoucher && (
          <>
            <VoucherSection latestVoucher={latestVoucher} nextVoucher={nextVoucher} />
            <Divider />
          </>
        )}
        <SubscriptionSection />
      </CallsCreditsContainer>
    );
  };

  return (
    <SettingsGridCard
      title={
        <>
          {intl.formatMessage({ id: 'common.settings.general.callsCredits.title' })}
          <Info
            tooltip={intl.formatMessage({ id: 'common.settings.general.callsCredits.title.tooltip' })}
            style={{ maxWidth: 256 }}
          />
          {isCallsStopped && <Unavailable css="margin-left: 8px" />}
        </>
      }
      titleColumns={4}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
    >
      {renderContent()}
    </SettingsGridCard>
  );
};
