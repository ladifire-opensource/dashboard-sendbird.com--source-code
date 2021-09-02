import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { useSupergroupFeature } from '@chat/hooks/useSupergroupFeature';

export const useSupergroupDescription = () => {
  const intl = useIntl();
  const { supergroupMemberLimit, isSupergroupSupportedByPlan, isSubscriptionLoaded } = useSupergroupFeature();

  return useMemo(() => {
    const limitAbbreviation = `${(supergroupMemberLimit / 1000).toFixed(0)}K`;

    return {
      tooltipDefinition: intl.formatMessage({ id: 'chat.channelList.list.column.memberCount.tooltip.supergroup.body' }),
      channelTypeName:
        isSubscriptionLoaded && isSupergroupSupportedByPlan
          ? intl.formatMessage({ id: 'chat.groupChannels.channelTypeBasedOnIsSuper.yes' }, { limitAbbreviation })
          : intl.formatMessage({ id: 'chat.groupChannels.channelTypeBasedOnIsSuper.yes.notSupportedByCurrentPlan' }),

      dialogDefinition: intl.formatMessage({
        id: 'chat.groupChannels.createGroupChannelDialog.field.isSuper.option.yes.tooltip.unsupportedByPlan',
      }),
    };
  }, [intl, isSubscriptionLoaded, isSupergroupSupportedByPlan, supergroupMemberLimit]);
};
