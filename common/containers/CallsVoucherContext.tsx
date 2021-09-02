import { createContext, FC, useContext, useMemo, useState, useEffect } from 'react';

import moment from 'moment-timezone';

import * as services from '@calls/services';
import * as commonApi from '@common/api';
import { useAsync, useErrorToast } from '@hooks';

export enum SubscriptionStatus {
  ON,
  OFF,
  PAYMENT_DECLINED,
}
export enum UsageStatus {
  Normal = 'normal',
  Warn = 'warn',
  Error = 'error',
}

const useAsyncSubscription = () => {
  const [fetchState, fetch] = useAsync(commonApi.fetchVoucherSubscription, []);
  const [updateState, update] = useAsync(commonApi.updateVoucherSubscription, []);
  const [removeState, remove] = useAsync(commonApi.deleteVoucherSubscription, []);
  const [state, setState] = useState<typeof fetchState>(fetchState);

  /* sync latest async state when promise of fetch, update or remove is resolved */
  useEffect(() => {
    if (fetchState) {
      setState(fetchState);
    }
  }, [fetchState]);

  useEffect(() => {
    if (updateState) {
      setState(updateState);
    }
  }, [updateState]);

  useEffect(() => {
    if (removeState) {
      setState(removeState);
    }
  }, [removeState]);

  return [state, { fetch, update, remove }] as const;
};

/* hook to store async data related to Calls usage */
const useCallsVoucherProvider = () => {
  const [vouchersState, fetchVouchers] = useAsync(commonApi.fetchVouchers, []);
  const [nextVoucherState, fetchNextVoucher] = useAsync(services.fetchNextVoucher, []);

  const [
    subscriptionState,
    { fetch: fetchSubscription, update: updateSubscription, remove: removeSubscription },
  ] = useAsyncSubscription();

  return {
    vouchers: {
      loading: vouchersState.status === 'loading',
      error: vouchersState.error ?? null,
      response: vouchersState.data,
    },
    nextVoucher: {
      loading: nextVoucherState.status === 'loading',
      error: nextVoucherState.error ?? null,
      response: nextVoucherState.data,
    },
    subscription: {
      loading: subscriptionState.status === 'loading',
      error: subscriptionState.error ?? null,
      response: subscriptionState.data,
    },
    fetchVouchers,
    fetchNextVoucher,
    fetchSubscription,
    updateSubscription,
    removeSubscription,
  };
};

type CallsVoucherContext = ReturnType<typeof useCallsVoucherProvider>;

export const CallsVoucherContext = createContext<CallsVoucherContext>({
  vouchers: { loading: false, error: null, response: undefined },
  fetchVouchers: commonApi.fetchVouchers,

  nextVoucher: { loading: false, error: null, response: undefined },
  fetchNextVoucher: services.fetchNextVoucher,

  subscription: { loading: false, error: null, response: undefined },
  fetchSubscription: commonApi.fetchVoucherSubscription,
  updateSubscription: commonApi.updateVoucherSubscription,
  removeSubscription: commonApi.deleteVoucherSubscription,
});

export const CallsVoucherProvider: FC = ({ children }) => {
  return <CallsVoucherContext.Provider value={useCallsVoucherProvider()}>{children}</CallsVoucherContext.Provider>;
};

export const useCallsVoucher = () => useContext(CallsVoucherContext);

const processVoucher = (voucher: Voucher & { invoice?: null | Invoice }) => {
  const { credit, transferred_credit, used_credit, expire_dt, invoice = null, paid_amount: price } = voucher;

  const quota = Math.max(credit, credit + transferred_credit);
  const usage = Math.max(0, used_credit);
  const balance = quota - usage;
  const usageRate = usage / quota;

  const expireAt = expire_dt ?? undefined;

  return { quota, usage, balance, expireAt, usageRate, invoice, price };
};

const isActive = (voucher: Voucher) => voucher.status === 'ACTIVE';
const isReserved = (voucher: Voucher) => voucher.status === 'READY';

export const useLatestVoucher = () => {
  const {
    vouchers: { response },
  } = useCallsVoucher();

  const latestVoucher = useMemo(() => {
    const vouchers = response?.data.results;
    const activeVoucher = vouchers?.find((voucher) => isActive(voucher));
    const endedVoucher = vouchers?.find((voucher) => !isReserved(voucher));
    const latest = activeVoucher ?? endedVoucher;

    return latest ? processVoucher(latest) : null;
  }, [response]);

  return latestVoucher;
};

export const useNextVoucher = () => {
  const {
    nextVoucher: { response },
  } = useCallsVoucher();

  const nextVoucher = useMemo(() => {
    return response?.voucher ? { ...processVoucher(response.voucher), invoice: response.invoice } : null;
  }, [response]);

  return nextVoucher;
};

export const useSubscription = () => {
  const { subscription: subscriptionState, nextVoucher: nextVoucherState } = useCallsVoucher();

  const subscription = subscriptionState.response?.data;
  const nextVoucherResponse = nextVoucherState.response;

  const status = useMemo(() => {
    if (!subscription || !nextVoucherResponse) {
      return null;
    }
    if (nextVoucherResponse.invoice?.status === 'FAILED') {
      return SubscriptionStatus.PAYMENT_DECLINED;
    }
    /* when it have no VoucherSubscription, subscription's all properties are null */
    if (subscription.voucher_subscription_credit === null) {
      return SubscriptionStatus.OFF;
    }

    return SubscriptionStatus.ON;
  }, [nextVoucherResponse, subscription]);

  return !subscription || status === null
    ? null
    : {
        status,
        credits: subscription.voucher_subscription_credit,
        amount: subscription.voucher_subscription_payment_amount,
        durationDays: subscription.voucher_subscription_duration_days,
      };
};

export const useVoucherLoader = (
  options: { vouchers?: boolean; subscription?: boolean; nextVoucher?: boolean } = {
    vouchers: true,
    subscription: true,
    nextVoucher: true,
  },
) => {
  const { vouchers, subscription, nextVoucher } = options;
  const {
    vouchers: { error: vouchersError },
    nextVoucher: { error: nextVoucherError },
    subscription: { error: subscriptionError },
    fetchVouchers,
    fetchSubscription,
    fetchNextVoucher,
  } = useCallsVoucher();

  useEffect(() => {
    vouchers && fetchVouchers();
  }, [fetchVouchers, vouchers]);

  useEffect(() => {
    subscription && fetchSubscription();
  }, [fetchSubscription, subscription]);

  useEffect(() => {
    nextVoucher && fetchNextVoucher();
  }, [fetchNextVoucher, nextVoucher]);

  useErrorToast(vouchersError);
  useErrorToast(subscriptionError);
  useErrorToast(nextVoucherError);
};

export const useVoucherError = () => {
  const { vouchers, subscription, nextVoucher } = useCallsVoucher();
  return vouchers.error || subscription.error || nextVoucher.error;
};

export const isActivatable = (voucher: ReturnType<typeof useNextVoucher>) =>
  voucher?.invoice?.status === 'PAID' || voucher?.price === 0;

const isReady = (nextVoucher: ReturnType<typeof useNextVoucher>, status: SubscriptionStatus) =>
  isActivatable(nextVoucher) || status === SubscriptionStatus.ON;

/**
 * return latest voucher's expiration status
 */
export const useVoucherExpirationStatus = () => {
  const EXPIRED_WARNING_MONTH = 1;
  const voucher = useLatestVoucher();
  const nextVoucher = useNextVoucher();
  const subscription = useSubscription();

  if (!voucher || !subscription) return null;

  const ready = isReady(nextVoucher, subscription.status);
  const expireAt = voucher.expireAt ? moment(voucher.expireAt) : null;

  if (expireAt?.isBefore()) {
    return UsageStatus.Error;
  }

  if (!ready && expireAt && expireAt.diff(moment(), 'months', true) < EXPIRED_WARNING_MONTH) {
    return UsageStatus.Warn;
  }

  return UsageStatus.Normal;
};

/**
 * return latest voucher's depletion status
 */
export const useVoucherDepletionStatus = () => {
  const DEPLETED_WARNING_RATE = 0.8;
  const voucher = useLatestVoucher();
  const nextVoucher = useNextVoucher();
  const subscription = useSubscription();

  if (!voucher || !subscription) return null;

  const ready = isReady(nextVoucher, subscription.status);
  const { usageRate } = voucher;

  if (usageRate >= 1) {
    return UsageStatus.Error;
  }
  if (!ready && usageRate >= DEPLETED_WARNING_RATE) {
    return UsageStatus.Warn;
  }

  return UsageStatus.Normal;
};

export const useVoucherAlert = () => {
  const expirationStatus = useVoucherExpirationStatus();
  const depletionStatus = useVoucherDepletionStatus();

  return [expirationStatus, depletionStatus].some((status) => status !== UsageStatus.Normal);
};
