import { useCurrentChatSubscription } from '@common/containers/CurrentChatSubscriptionProvider';
import { useAuthorization, useShallowEqualSelector } from '@hooks';

import { useGroupChannelJoinedMemberCount } from './useGroupChannelJoinedMemberCount';

const DEFAULT_SUPERGROUP_MEMBER_LIMIT = 2000;

interface SupergroupFeatureStatus {
  isSubscriptionLoaded: boolean;
  isSupergroupEnabled: boolean;
  isSupergroupSupportedByPlan: boolean;
  supergroupMemberLimit: number;
}

export const useSupergroupFeature = (): SupergroupFeatureStatus => {
  const { currentSubscription, isLoaded } = useCurrentChatSubscription();
  const { isFeatureEnabled, isSelfService } = useAuthorization();
  const groupChannelJoinedMemberCount = useGroupChannelJoinedMemberCount();

  const v1OrgResult = useShallowEqualSelector((state) => {
    const premiumFeatures = state.applicationState.data?.current_premium_features;
    return {
      isSupergroupSupportedByPlan: premiumFeatures?.super_group_channel ?? false,
      isSupergroupEnabled: premiumFeatures?.super_group_channel ?? false,
      supergroupMemberLimit: premiumFeatures?.super_group_member_limit ?? groupChannelJoinedMemberCount,
    };
  });

  if (!isSelfService) {
    return { isSubscriptionLoaded: true, ...v1OrgResult };
  }

  // FIXME: if supergroup property always exists, we can remove this block.
  if (currentSubscription?.plan.supergroup) {
    return {
      isSubscriptionLoaded: isLoaded,
      isSupergroupEnabled: isFeatureEnabled('supergroup'),
      isSupergroupSupportedByPlan: currentSubscription.plan.supergroup.enabled ?? false,
      supergroupMemberLimit: (currentSubscription.plan.supergroup.tier as number) ?? DEFAULT_SUPERGROUP_MEMBER_LIMIT,
    };
  }

  return {
    isSubscriptionLoaded: isLoaded,
    isSupergroupEnabled: isFeatureEnabled('supergroup'),
    isSupergroupSupportedByPlan: false,
    supergroupMemberLimit: DEFAULT_SUPERGROUP_MEMBER_LIMIT,
  };
};
