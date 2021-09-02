import { FC, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { InlineNotification, Link, LinkVariant } from 'feather';

import { PropsOf } from '@utils';

import {
  SubscriptionStatus,
  UsageStatus,
  useSubscription,
  useVoucherDepletionStatus,
  useVoucherExpirationStatus,
} from '../CallsVoucherContext';

const TextLink: FC<{ to: string }> = ({ children, to }) => {
  return (
    <Link variant={LinkVariant.Mono} useReactRouter={true} href={to}>
      {children}
    </Link>
  );
};

const renderLink = (text: string) => <TextLink to="/settings/general">{text}</TextLink>;

type NotificationProps = Omit<PropsOf<typeof InlineNotification>, 'type'>;

const Error: FC<NotificationProps> = (props) => (
  <InlineNotification className="InlineNotification" type="error" {...props} />
);

const Warning: FC<NotificationProps> = (props) => (
  <InlineNotification className="InlineNotification" type="warning" {...props} />
);

const CallsPaymentDeclined = () => {
  const intl = useIntl();
  return (
    <Error
      data-test-id="CallsPaymentDeclined"
      message={intl.formatMessage({ id: 'common.home.notifications.callsPaymentDeclined' }, { a: renderLink })}
    />
  );
};

const CallsExpirationError = () => {
  const intl = useIntl();
  return (
    <Error
      data-test-id="CallsExpirationError"
      message={intl.formatMessage({ id: 'common.home.notifications.callsExpirationError' }, { a: renderLink })}
    />
  );
};

const CallsDepletionError = () => {
  const intl = useIntl();
  return (
    <Error
      data-test-id="CallsDepletionError"
      message={intl.formatMessage({ id: 'common.home.notifications.callsDepletionError' }, { a: renderLink })}
    />
  );
};

const CallsExpirationAndDepletionError = () => {
  const intl = useIntl();
  return (
    <Error
      data-test-id="CallsExpirationAndDepletionError"
      message={intl.formatMessage(
        { id: 'common.home.notifications.callsExpirationAndDepletionError' },
        { a: renderLink },
      )}
    />
  );
};

const CallsDepletionWarning = () => {
  const intl = useIntl();
  return (
    <Warning
      data-test-id="CallsDepletionWarning"
      message={intl.formatMessage({ id: 'common.home.notifications.callsDepletionWarning' }, { a: renderLink })}
    />
  );
};

const CallsExpirationWarning = () => {
  const intl = useIntl();
  return (
    <Warning
      data-test-id="CallsExpirationWarning"
      message={intl.formatMessage({ id: 'common.home.notifications.callsExpirationWarning' }, { a: renderLink })}
    />
  );
};

const CallsExpirationAndDepletionWarning = () => {
  const intl = useIntl();
  return (
    <Warning
      data-test-id="CallsExpirationAndDepletionWarning"
      message={intl.formatMessage(
        { id: 'common.home.notifications.callsExpirationAndDepletionWarning' },
        { a: renderLink },
      )}
    />
  );
};

export const Notifications = () => {
  const subscription = useSubscription();
  const depletionStatus = useVoucherDepletionStatus();
  const expirationStatus = useVoucherExpirationStatus();

  const voucherNotification = useMemo(() => {
    if (!depletionStatus || !expirationStatus) {
      return null;
    }

    /* errors */
    const isDepletionError = depletionStatus === UsageStatus.Error;
    const isExpirationError = expirationStatus === UsageStatus.Error;

    if (isDepletionError && isExpirationError) {
      return <CallsExpirationAndDepletionError />;
    }
    if (isExpirationError) {
      return <CallsExpirationError />;
    }
    if (isDepletionError) {
      return <CallsDepletionError />;
    }

    /* warnings */
    const isDepletionWarning = depletionStatus === UsageStatus.Warn;
    const isExpirationWarning = expirationStatus === UsageStatus.Warn;

    if (isDepletionWarning && isExpirationWarning) {
      return <CallsExpirationAndDepletionWarning />;
    }
    if (isExpirationWarning) {
      return <CallsExpirationWarning />;
    }
    if (isDepletionWarning) {
      return <CallsDepletionWarning />;
    }
  }, [depletionStatus, expirationStatus]);

  return (
    <>
      {/* FIXME: add other notifications here */}
      {/* e.g. <InlineNotification className="orgNotification" type="warning" message="2 features went over 80% of the quota in your plan." /> */}
      {voucherNotification}
      {subscription?.status === SubscriptionStatus.PAYMENT_DECLINED && <CallsPaymentDeclined />}
    </>
  );
};
