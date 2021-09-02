import { useSelector } from 'react-redux';

import { useCurrentChatSubscription } from '@common/containers/CurrentChatSubscriptionProvider';
import { ChatFeatureName } from '@constants';
import { useAuthorization } from '@hooks';
import { logException } from '@utils';

export enum ModerationToolAvailability {
  Loading = 'loading',
  Available = 'available',
  FeatureOff = 'feature_off',
  NotSupported = 'not_supported',
  V1OrgUnavailable = 'v1_org_unavailable',
}

export const useModerationToolAvailability = (channelType: ChannelType) => {
  const { isSelfService, isFeatureEnabled } = useAuthorization();
  const { isLoading: isLoadingSubscription, currentSubscription } = useCurrentChatSubscription();
  const currentPremiumFeatures = useSelector(
    (state: RootState) => state.applicationState.data?.current_premium_features,
  );

  if (isSelfService) {
    if (isLoadingSubscription || currentSubscription == null) {
      return ModerationToolAvailability.Loading;
    }

    if (currentSubscription.plan == null) {
      // FIXME: just for debugging - should be deleted after debugging
      logException({ error: new Error('subscription.plan is null'), context: { currentSubscription } });
      return ModerationToolAvailability.NotSupported;
    }

    if (currentSubscription.plan.moderation_tools.enabled) {
      return isFeatureEnabled(ChatFeatureName.ModerationTools)
        ? ModerationToolAvailability.Available
        : ModerationToolAvailability.FeatureOff;
    }

    return ModerationToolAvailability.NotSupported;
  }

  if (currentPremiumFeatures == null) {
    return ModerationToolAvailability.Loading;
  }
  return (channelType === 'open_channels' && currentPremiumFeatures.moderation_open) ||
    (channelType === 'group_channels' && currentPremiumFeatures.moderation_group)
    ? ModerationToolAvailability.Available
    : ModerationToolAvailability.V1OrgUnavailable;
};
