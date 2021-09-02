import { ComponentProps, useCallback, useReducer } from 'react';
import { useIntl } from 'react-intl';

import moment from 'moment-timezone';

import { DEFAULT_DATE_FORMAT, SubscriptionProduct } from '@constants';
import { fetchMessagingUsage } from '@core/api';
import { useAppId, useAuthorization } from '@hooks';
import { useCurrentSubscription } from '@hooks/useCurrentSubscription';
import { Usage } from '@ui/components';
import { logException } from '@utils/logException';

type Quota = ComponentProps<typeof Usage>;

type State = {
  quota: Quota[];
  isFetchingQuota: boolean;
  didFailToFetchQuota: boolean;
  usage: Usage[];
  isFetchingUsage: boolean;
  didFailToFetchUsage: boolean;
};

type Action =
  | { type: 'UPDATE_USAGE_REQUEST' }
  | { type: 'UPDATE_USAGE_SUCCESS'; payload: Usage[] }
  | { type: 'UPDATE_USAGE_FAIL' }
  | { type: 'UPDATE_QUOTA_REQUEST' }
  | { type: 'UPDATE_QUOTA_SUCCESS'; payload: Quota[] }
  | { type: 'UPDATE_QUOTA_FAIL' };

const thisMonthRange = `${moment().tz('UTC').startOf('month').format(DEFAULT_DATE_FORMAT)} - ${moment()
  .tz('UTC')
  .format(DEFAULT_DATE_FORMAT)}`;

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'UPDATE_USAGE_REQUEST':
      return { ...state, isFetchingUsage: true };
    case 'UPDATE_USAGE_SUCCESS':
      return { ...state, isFetchingUsage: false, usage: action.payload, didFailToFetchUsage: false };
    case 'UPDATE_USAGE_FAIL':
      return { ...state, isFetchingUsage: false, didFailToFetchUsage: true };
    case 'UPDATE_QUOTA_REQUEST':
      return { ...state, isFetchingQuota: true };
    case 'UPDATE_QUOTA_SUCCESS':
      return { ...state, isFetchingQuota: false, quota: action.payload, didFailToFetchQuota: false };
    case 'UPDATE_QUOTA_FAIL':
      return { ...state, isFetchingQuota: false, didFailToFetchQuota: true };
    default:
      return state;
  }
};

const useProductView = () => {
  const [
    { isFetchingQuota, isFetchingUsage, quota, usage, didFailToFetchQuota, didFailToFetchUsage },
    dispatch,
  ] = useReducer(reducer, {
    quota: [],
    isFetchingQuota: false,
    didFailToFetchQuota: false,
    usage: [],
    isFetchingUsage: false,
    didFailToFetchUsage: false,
  });

  return {
    dispatch,
    quota,
    usage,
    isFetchingQuota,
    isFetchingUsage,
    didFailToFetchQuota,
    didFailToFetchUsage,
  };
};

export const useChatProductView = () => {
  const appId = useAppId();
  const intl = useIntl();
  const { isPermitted, isSelfService } = useAuthorization();
  const { dispatch, ...states } = useProductView();
  const { currentSubscription } = useCurrentSubscription(SubscriptionProduct.Chat);

  const updateChatUsageAndQuota = useCallback(async () => {
    dispatch({ type: 'UPDATE_USAGE_REQUEST' });
    dispatch({ type: 'UPDATE_QUOTA_REQUEST' });

    if (isSelfService && !currentSubscription) {
      return;
    }

    try {
      const response = await fetchMessagingUsage(appId);
      const usageData = response.data.usage;

      dispatch({
        type: 'UPDATE_USAGE_SUCCESS',
        payload: [
          {
            label: intl.formatMessage({ id: 'core.overview.usage.messaging_label.mau' }),
            description: thisMonthRange,
            types: 'only',
            data: {
              previousValue: usageData.mau.previous || 0,
              value: usageData.mau.current || 0,
            },
          },
          {
            label: intl.formatMessage({ id: 'core.overview.usage.messaging_label.dau' }),
            types: 'only',
            data: {
              previousValue: usageData.dau.previous || 0,
              value: usageData.dau.current || 0,
            },
          },
          {
            label: intl.formatMessage({ id: 'core.overview.usage.messaging_label.connections' }),
            description: thisMonthRange,
            types: 'max',
            tooltip: intl.formatMessage({ id: 'core.overview.usage.messaging_label.connections.tooltip' }),
            data: {
              current: usageData.ccu.peak || 0,
              max: usageData.ccu.peak || 0,
            },
          },
        ],
      });

      if (isSelfService) {
        dispatch({
          type: 'UPDATE_QUOTA_SUCCESS',
          payload: [
            {
              label: intl.formatMessage({ id: 'core.overview.quota.messaging_label.mau' }),
              usage: usageData.mau.current,
              quota: currentSubscription?.plan['mau'].purchased_units || 0,
              limit: currentSubscription?.plan['mau'].hard_limit || 0,
              showLegends: true,
            },
            {
              label: intl.formatMessage({ id: 'core.overview.quota.messaging_label.connections' }),
              usage: usageData.ccu.peak,
              quota: currentSubscription?.plan['pc'].purchased_units || 0,
              limit: currentSubscription?.plan['pc'].hard_limit || 0,
              markerSuffix: ' (Highest)',
            },
          ],
        });
      } else {
        dispatch({
          type: 'UPDATE_QUOTA_SUCCESS',
          payload: [
            {
              label: intl.formatMessage({ id: 'core.overview.quota.messaging_label.mau' }),
              usage: usageData.mau.current,
              quota: usageData.mau.limit,
              showLegends: true,
            },
            {
              label: intl.formatMessage({ id: 'core.overview.quota.messaging_label.connections' }),
              usage: usageData.ccu.peak,
              quota: usageData.ccu.limit,
              markerSuffix: ' (Highest)',
            },
          ],
        });
      }
    } catch (error) {
      logException(error);
      dispatch({ type: 'UPDATE_QUOTA_FAIL' });
      dispatch({ type: 'UPDATE_USAGE_FAIL' });
    }
  }, [appId, currentSubscription, intl, isSelfService, dispatch]);

  const hasPermission = isPermitted(['application.overview.view']);

  const load = useCallback(() => {
    if (hasPermission && appId) {
      updateChatUsageAndQuota();
    }
  }, [hasPermission, appId, updateChatUsageAndQuota]);

  return { ...states, actions: { load } };
};
