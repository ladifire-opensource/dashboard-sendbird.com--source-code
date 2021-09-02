import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

export const fetchCardInfo = ({ organization_uid }) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${organization_uid}/card/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const initCardRegistration: InitCardRegistrationAPI = (organization_uid) => {
  return axios.post(
    `${getGateURL()}/dashboard_api/organizations/${organization_uid}/init_card_registration/`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const registerCard = (organization_uid: string, payment_method_id: string) => {
  return axios.post(
    `${getGateURL()}/dashboard_api/organizations/${organization_uid}/card/`,
    {
      payment_method: payment_method_id,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const fetchCurrentSubscription: FetchCurrentSubscriptionAPI = (product) => {
  return axios.get(`${getGateURL()}/dashboard_api/billing/subscriptions/current/?product=${product}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchSubscriptionInfo: FetchSubscriptionInfoAPI = (product) => {
  return axios.get(`${getGateURL()}/dashboard_api/billing/subscriptions/info/?product=${product}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchSubscriptionByMonth: FetchSubscriptionByMonthAPI = ({ month, product }) => {
  return axios.get(`${getGateURL()}/dashboard_api/billing/subscriptions/month/?month=${month}&product=${product}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const subscribeSubscriptionPlan: SubscribeSubscriptionPlanAPI = (payload) => {
  return axios.post(`${getGateURL()}/dashboard_api/billing/subscriptions/subscribe/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const unsubscribeSubscriptionPlan: UnsubscribeSubscriptionPlanAPI = ({ subscription_id, endReason }) => {
  return axios.post(
    `${getGateURL()}/dashboard_api/billing/subscriptions/${subscription_id}/unsubscribe/`,
    { end_reason: endReason },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const cancelUnsubscribeSubscription: CancelUnsubscribeSubscriptionAPI = (subscription_id) => {
  return axios.post(
    `${getGateURL()}/dashboard_api/billing/subscriptions/${subscription_id}/cancel_unsubscribe/`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const cancelDowngradeSubscription: CancelDowngradeSubscriptionAPI = (subscription_id) => {
  return axios.post(
    `${getGateURL()}/dashboard_api/billing/subscriptions/${subscription_id}/cancel_downgrade/`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const fetchInvoices: FetchInvoicesAPI = (params) => {
  return axios.get(`${getGateURL()}/dashboard_api/billing/invoices/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
    params,
  });
};

export const fetchBillingContacts: FetchBillingContactAPI = (uid) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${uid}/billing_contacts/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const updateBillingContacts: UpdateBillingContactsAPI = ({ uid, payload }) => {
  return axios.put(`${getGateURL()}/dashboard_api/organizations/${uid}/billing_contacts/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchSubscriptionPlans: FetchSubscriptionPlansAPI = (organization_uid) => {
  return axios.get(`${getGateURL()}/dashboard_api/billing/plans/?organization_uid=${organization_uid}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchLatestVoucher = () => {
  /* it responses empty object({}) when there is no voucher of organization */
  return axios.get<Voucher | {}>(`${getGateURL()}/dashboard_api/billing/vouchers/latest/`, {
    headers: { authorization: getSBAuthToken() },
  });
};

export const fetchVoucherSubscription = () => {
  return axios.get<VoucherSubscription>(`${getGateURL()}/dashboard_api/billing/vouchers/subscription/`, {
    headers: { authorization: getSBAuthToken() },
  });
};

export const updateVoucherSubscription = (payload: VoucherSubscription) => {
  return axios.put<VoucherSubscription>(`${getGateURL()}/dashboard_api/billing/vouchers/subscription/`, payload, {
    headers: { authorization: getSBAuthToken() },
  });
};

export const deleteVoucherSubscription = () => {
  return axios.delete<VoucherSubscription>(`${getGateURL()}/dashboard_api/billing/vouchers/subscription/`, {
    headers: { authorization: getSBAuthToken() },
  });
};

export const fetchVouchers = (params?: {
  status?: 'READY' | 'ACTIVE' | 'EXPIRED';
  ordering?: 'created_at' | '-created_at' | 'start_dt' | '-start_dt' | 'status';
  limit?: number;
}) => {
  return axios.get<Page<Voucher>>(`${getGateURL()}/dashboard_api/billing/vouchers/`, {
    headers: { authorization: getSBAuthToken() },
    params,
  });
};

export const createVoucher = (payload: { credit: number; paid_amount: number; duration_days: number }) => {
  return axios.post<Voucher>(`${getGateURL()}/dashboard_api/billing/vouchers/`, payload, {
    headers: { authorization: getSBAuthToken() },
  });
};

export const purchaseVoucher = (voucherUid: string) => {
  return axios.post<Voucher>(
    `${getGateURL()}/dashboard_api/billing/vouchers/${voucherUid}/pay/`,
    {},
    { headers: { authorization: getSBAuthToken() } },
  );
};

export const activateVoucher = (voucherUid: string) => {
  return axios.put<Voucher>(
    `${getGateURL()}/dashboard_api/billing/vouchers/${voucherUid}/activate/`,
    {},
    { headers: { authorization: getSBAuthToken() } },
  );
};

export const fetchCreditRates = () => {
  return axios.get<CreditRates>(`${getGateURL()}/dashboard_api/billing/vouchers/credit_rates_per_minute/`, {
    headers: { authorization: getSBAuthToken() },
  });
};

export const fetchDiscountTable = () => {
  return axios.get<DiscountsTable>(`${getGateURL()}/dashboard_api/billing/vouchers/discount_table/`, {
    headers: { authorization: getSBAuthToken() },
  });
};

export const fetchACHCreditTransferSource = (uid) => {
  return axios.get<ACHCreditTransferSource>(
    `${getGateURL()}/dashboard_api/organizations/${uid}/ach_credit_transfer_source/`,
    {
      headers: { authorization: getSBAuthToken() },
    },
  );
};
