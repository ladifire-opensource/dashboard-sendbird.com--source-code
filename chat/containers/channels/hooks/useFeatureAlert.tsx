import { useMemo, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { InlineNotification } from 'feather';

import { FeatureSettingLink, ContactSalesLink, PlanUpgradeLink } from '../PlanErrorResolutionLink';
import { ModerationToolAvailability, useModerationToolAvailability } from './useModerationToolAvailability';

type ModerationToolAvailabilityWithAlert =
  | ModerationToolAvailability.NotSupported
  | ModerationToolAvailability.FeatureOff
  | ModerationToolAvailability.V1OrgUnavailable;

const intlMessageKeys: Record<ChannelType, Record<ModerationToolAvailabilityWithAlert, string>> = {
  open_channels: {
    [ModerationToolAvailability.NotSupported]: 'chat.openChannels.list.featureAlert.notSupported',
    [ModerationToolAvailability.FeatureOff]: 'chat.openChannels.list.featureAlert.featureOff',
    [ModerationToolAvailability.V1OrgUnavailable]: 'chat.openChannels.list.featureAlert.v1OrgUnavailable',
  },
  group_channels: {
    [ModerationToolAvailability.NotSupported]: 'chat.groupChannels.list.featureAlert.notSupported',
    [ModerationToolAvailability.FeatureOff]: 'chat.groupChannels.list.featureAlert.featureOff',
    [ModerationToolAvailability.V1OrgUnavailable]: 'chat.groupChannels.list.featureAlert.v1OrgUnavailable',
  },
};

const Bold = styled.b`
  font-weight: 600;
`;

export const useFeatureAlert = (channelType: ChannelType) => {
  const intl = useIntl();
  const featureAvailability = useModerationToolAvailability(channelType);

  const featureAlert = useMemo(() => {
    const renderNotification = (message: ReactNode) => <InlineNotification message={message} type="info" />;

    const values = {
      b: (text: string) => <Bold>{text}</Bold>,
      featuresettinglink: (text: string) => <FeatureSettingLink>{text}</FeatureSettingLink>,
      planupgradelink: (text: string) => <PlanUpgradeLink>{text}</PlanUpgradeLink>,
      contactsaleslink: (text: string) => <ContactSalesLink>{text}</ContactSalesLink>,
    };

    switch (featureAvailability) {
      case ModerationToolAvailability.NotSupported:
      case ModerationToolAvailability.FeatureOff:
      case ModerationToolAvailability.V1OrgUnavailable:
        return renderNotification(
          intl.formatMessage({ id: intlMessageKeys[channelType][featureAvailability] }, values),
        );
      default:
        return null;
    }
  }, [channelType, featureAvailability, intl]);

  return featureAlert;
};
