import { createFreeVoucher } from '@calls/api';
import * as commonApi from '@common/api';

/**
 * check existence of a voucher for this organization and if no voucher has been issued, issue a free voucher.
 */
export const requestFreeVoucher = async (appId: string) => {
  const { data } = await commonApi.fetchVouchers({ limit: 1 });
  const shouldIssueFreeVoucher = data.count === 0;

  if (shouldIssueFreeVoucher) {
    await createFreeVoucher(appId);
    return { isFreeVoucherIssued: true };
  }

  return { isFreeVoucherIssued: false };
};

/**
 * voucher purchase process:
 * make a payment
 *  → (optional - if there are no active voucher) activate voucher
 *  → enable same subscription with voucher purchase
 */
const processVoucherPayment = async (voucherUid: string) => {
  const purchased = await commonApi.purchaseVoucher(voucherUid);

  const processActivation = async () => {
    const { data } = await commonApi.fetchVouchers({ status: 'ACTIVE', limit: 1 });
    const hasActiveVoucher = data.count > 0;

    return hasActiveVoucher ? purchased : commonApi.activateVoucher(voucherUid);
  };

  const processSubscription = async () => {
    const { credit, paid_amount, duration_days } = purchased.data;

    const response = await commonApi.updateVoucherSubscription({
      voucher_subscription_credit: credit,
      voucher_subscription_payment_amount: paid_amount,
      voucher_subscription_duration_days: duration_days,
    });

    return response;
  };

  const [{ data: voucher }, { data: subscription }] = await Promise.all([processActivation(), processSubscription()]);

  return { voucher, subscription };
};

export const purchaseVoucher = async (params: { credits: number; price: number; duration: number }) => {
  const { credits, price, duration } = params;
  const priceInCents = Math.round(price * 100);

  const { data: voucher } = await commonApi.createVoucher({
    credit: credits,
    paid_amount: priceInCents,
    duration_days: duration,
  });

  return processVoucherPayment(voucher.uid);
};

type NextVoucher = {
  voucher: Voucher | null;
  invoice: Invoice | null;
};
export const fetchNextVoucher = async (): Promise<NextVoucher> => {
  const { data: vouchersResponse } = await commonApi.fetchVouchers({
    status: 'READY',
    ordering: '-created_at',
    limit: 1,
  });
  const [nextVoucher] = vouchersResponse.results;

  if (!nextVoucher) {
    return { voucher: null, invoice: null };
  }

  const { data: invoiceResponse } = await commonApi.fetchInvoices({
    limit: 1,
    offset: 0,
    voucher__isnull: false,
    voucher_uid: nextVoucher.uid,
  });
  const [invoice = null] = invoiceResponse.results;

  return { voucher: nextVoucher, invoice };
};

export const purchaseFailedVoucher = processVoucherPayment;
