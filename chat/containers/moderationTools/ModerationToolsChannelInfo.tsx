import { FC } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, batch } from 'react-redux';

import styled, { css } from 'styled-components';

import {
  IconButton,
  Tag,
  Link,
  Headings,
  cssVariables,
  Body,
  Tooltip,
  TooltipTargetIcon,
  TooltipVariant,
  transitionDefault,
  toast,
  Toggle,
} from 'feather';
import moment from 'moment-timezone';

import { chatActions } from '@actions';
import { DataFieldLabelTooltipIcon } from '@chat/containers/channels/DataFieldLabelTooltipIcon';
import { GroupChannelTypeTooltipContent } from '@chat/containers/channels/GroupChannelTypeTooltipContent';
import { DynamicPartitioningTooltipIcon } from '@chat/containers/channels/OpenChannels/DynamicPartitioningTooltipIcon';
import { ContactSalesLink, FeatureSettingLink } from '@chat/containers/channels/PlanErrorResolutionLink';
import { useSupergroupDescription } from '@chat/containers/channels/hooks/useSupergroupDescription';
import { isOpenChannel, isGroupChannel } from '@chat/containers/channels/typeGuards';
import { useCurrentDynamicPartitioningOption } from '@chat/containers/settings/ChannelsSettings/hooks';
import { useGroupChannelJoinedMemberCount } from '@chat/hooks/useGroupChannelJoinedMemberCount';
import { useSupergroupFeature } from '@chat/hooks/useSupergroupFeature';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { useSupergroupFeatureName } from '@common/hooks';
import { DATE_WITH_SECONDS_FORMAT, EMPTY_TEXT } from '@constants';
import { getErrorMessage } from '@epics';
import { useAuthorization, useShowDialog, useCopy } from '@hooks';
import { InfoTooltip } from '@ui/components';

import { useFreezeChannel } from './hooks/useFreezeChannel';

type Props = {
  channelType: ChannelType;
  channel: OpenChannel | GroupChannel;
};

const Container = styled.div``;

const Section = styled.section`
  padding-bottom: 16px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const Title = styled.h5`
  display: flex;
  align-items: center;
  height: 48px;
  padding-left: 16px;
  padding-right: 12px;
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-10')};

  * + * {
    margin-left: 8px;
  }
`;

const InformationList = styled.dl`
  display: grid;
  grid-template-columns: 76px 1fr;
  grid-gap: 12px 8px;
  align-items: start;
  padding: 0 16px;
  margin-top: 8px;
  font-size: 14px;
  line-height: 20px;
`;

const InformationLabel = styled.dt`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  grid-column: 1 / span 1;
  align-items: center;
  word-break: break-word;
  color: ${cssVariables('neutral-7')};
  hyphens: auto;
  ${Body['body-short-01']};
`;

const InformationDetail = styled.dd`
  grid-column: 2 / span 1;
`;

const SupergroupChannelType = styled.div<{ hasError: boolean }>`
  display: flex;
  align-items: center;

  ${({ hasError }) =>
    hasError &&
    css`
      color: ${cssVariables('red-5')};
      font-weight: 600;
    `}
`;

const URLWrapper = styled(InformationDetail)`
  display: flex;

  span {
    flex: 1;
    word-break: break-all;
    margin-right: 4px;
  }
`;

const Bold = styled.b`
  font-weight: 600;
`;

const ClickToCopy: FC<{ children: string }> = ({ children }) => {
  const intl = useIntl();
  const copyAndAlert = useCopy();

  return (
    <Tooltip
      variant={TooltipVariant.Dark}
      content={intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.url.clickToCopy' })}
      placement="top"
    >
      <span
        role="button"
        css={`
          cursor: pointer;
          outline: 0;
          transition: box-shadow 0.3s ${transitionDefault};

          &:hover {
            text-decoration: underline;
          }

          &:active {
            color: ${cssVariables('purple-7')};
          }

          &:focus {
            box-shadow: ${cssVariables('purple-7')} 0 0 0 2px;
          }
        `}
        onClick={() => copyAndAlert(children)}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            copyAndAlert(children);
          }
        }}
        tabIndex={-1}
      >
        {children}
      </span>
    </Tooltip>
  );
};

export const ModerationToolsChannelInfo: FC<Props> = ({ channel, channelType }) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const isEditable = isPermitted(['application.channels.openChannel.all', 'application.channels.groupChannel.all']);
  const canFreezeChannel = isPermitted([
    'application.channels.openChannel.all',
    'application.channels.openChannel.chat',
    'application.channels.groupChannel.all',
    'application.channels.groupChannel.chat',
  ]);

  const { channelTypeName: supergroupChannelTypeName } = useSupergroupDescription();
  const { isSupergroupEnabled, isSupergroupSupportedByPlan, isSubscriptionLoaded } = useSupergroupFeature();
  const supergroupFeatureName = useSupergroupFeatureName();
  const { isUsingDynamicPartitioning, option } = useCurrentDynamicPartitioningOption();
  const copyAndAlert = useCopy();
  const { isUpdating: isUpdatingFreeze, setChannelFreeze } = useFreezeChannel();
  const dispatch = useDispatch();

  const showDialog = useShowDialog();

  const openEditMetadataDialog = useShowDialog({
    dialogTypes: DialogType.ChannelMetadata,
    dialogProps: { channel, channelType },
  });

  const openEditChannelDialog = (autoFocusFieldName?: 'data') => {
    showDialog({
      dialogTypes: DialogType.EditChannel,
      dialogProps: { channel, channelType, autoFocusFieldName },
    });
  };

  const toggleFreeze = async (freeze: boolean) => {
    if (isUpdatingFreeze) {
      return;
    }
    try {
      const updatedChannel = await setChannelFreeze({ channelUrl: channel.channel_url, freeze, channelType });

      batch(() => {
        if (isOpenChannel(updatedChannel)) {
          dispatch(chatActions.setCurrentOpenChannel(updatedChannel));
          dispatch(chatActions.updateOpenChannelInList(updatedChannel));
        } else if (isGroupChannel(updatedChannel)) {
          dispatch(chatActions.setCurrentGroupChannel(updatedChannel));
          dispatch(chatActions.updateGroupChannelInList(updatedChannel));
        }
      });
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
    }
  };

  const groupChannelJoinedMemberCount = useGroupChannelJoinedMemberCount();
  const isSupergroupFeatureOff = isSubscriptionLoaded && !isSupergroupEnabled;
  const isAccommodatableByDefaultGroupChannel =
    channelType === 'group_channels' && (channel as GroupChannel).member_count <= groupChannelJoinedMemberCount;

  const renderOpenChannelSubchannels = (option: DynamicPartitioningOption) => {
    if (option === 'single_subchannel') {
      return intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.subchannels.single' });
    }
    if (option === 'multiple_subchannels') {
      return intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.subchannels.multiple' });
    }
    if (option === 'custom') {
      return intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.subchannels.custom' });
    }
    return EMPTY_TEXT;
  };

  return (
    <Container>
      <Section>
        <Title>
          <span>{intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.title' })}</span>
          {isEditable && (
            <Link role="button" onClick={() => openEditChannelDialog()} data-test-id="EditChannelButton">
              {intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.btn.edit' })}
            </Link>
          )}
        </Title>
        <InformationList>
          <InformationLabel>
            {intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.createdAt' })}
          </InformationLabel>
          <InformationDetail>{moment(channel.created_at * 1000).format(DATE_WITH_SECONDS_FORMAT)}</InformationDetail>
          {channelType === 'group_channels' && (
            <>
              <InformationLabel css="align-self: baseline;">
                {intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.isSuper' })}
                <Tooltip
                  variant={TooltipVariant.Light}
                  content={<GroupChannelTypeTooltipContent />}
                  tooltipContentStyle="max-width: 256px;"
                  placement="bottom-end"
                >
                  <TooltipTargetIcon icon="info" />
                </Tooltip>
              </InformationLabel>
              <InformationDetail css="align-self: baseline;">
                {(channel as GroupChannel).is_super ? (
                  <SupergroupChannelType hasError={isSupergroupFeatureOff}>
                    {supergroupChannelTypeName}
                    {isSupergroupFeatureOff && (
                      <Tooltip
                        variant={TooltipVariant.Light}
                        content={(() => {
                          if (isSupergroupSupportedByPlan) {
                            return intl.formatMessage(
                              {
                                id: isAccommodatableByDefaultGroupChannel
                                  ? 'chat.channelDetail.sidebar.channelInformation.list.isSuper.supergroup.tooltip.featureOff.default'
                                  : 'chat.channelDetail.sidebar.channelInformation.list.isSuper.supergroup.tooltip.featureOff.limitExceeded',
                              },
                              {
                                a: (text) => <FeatureSettingLink alertType="dialog">{text}</FeatureSettingLink>,
                                b: (text: string) => <Bold>{text}</Bold>,
                                featureName: supergroupFeatureName,
                              },
                            );
                          }
                          return intl.formatMessage(
                            {
                              id: isAccommodatableByDefaultGroupChannel
                                ? 'chat.channelDetail.sidebar.channelInformation.list.isSuper.supergroup.tooltip.notSupportedByCurrentPlan.default'
                                : 'chat.channelDetail.sidebar.channelInformation.list.isSuper.supergroup.tooltip.notSupportedByCurrentPlan.limitExceeded',
                            },
                            { a: (text) => <ContactSalesLink alertType="dialog">{text}</ContactSalesLink> },
                          );
                        })()}
                        tooltipContentStyle="max-width: 256px; font-weight: 400;"
                        placement="bottom"
                      >
                        <TooltipTargetIcon
                          icon="warning-filled"
                          color="currentColor"
                          data-test-id="SupergroupFeatureOffTooltipTarget"
                        />
                      </Tooltip>
                    )}
                  </SupergroupChannelType>
                ) : (
                  intl.formatMessage({ id: 'chat.groupChannels.channelTypeBasedOnIsSuper.no' })
                )}
              </InformationDetail>
            </>
          )}
          {channelType === 'open_channels' && isUsingDynamicPartitioning && option && (
            <>
              <InformationLabel css="display: block;">
                {intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.subchannels' })}
                <DynamicPartitioningTooltipIcon
                  css={`
                    display: inline-flex;
                    height: 20px;
                    vertical-align: top;
                    align-items: center;
                  `}
                />
              </InformationLabel>
              <InformationDetail>{renderOpenChannelSubchannels(option)}</InformationDetail>
            </>
          )}
          <InformationLabel>
            {intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.url' })}
          </InformationLabel>
          <URLWrapper>
            <ClickToCopy>{channel.channel_url}</ClickToCopy>
            <IconButton
              icon="copy"
              size="xsmall"
              buttonType="tertiary"
              title={intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.url.clickToCopy' })}
              onClick={() => {
                copyAndAlert(channel.channel_url);
              }}
            />
          </URLWrapper>
          <InformationLabel>
            {intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.customType' })}
          </InformationLabel>
          <InformationDetail>
            {channel.custom_type ? <Tag maxWidth={187}>{channel.custom_type}</Tag> : EMPTY_TEXT}
          </InformationDetail>
          {isEditable && (
            <>
              <InformationLabel>
                {intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.data' })}
                <DataFieldLabelTooltipIcon />
              </InformationLabel>
              <InformationDetail>
                <Link role="button" onClick={() => openEditChannelDialog('data')}>
                  {intl.formatMessage({
                    id: 'chat.channelDetail.sidebar.channelInformation.list.metadata.btn.edit',
                  })}
                </Link>
              </InformationDetail>
              <InformationLabel>
                {intl.formatMessage({ id: 'chat.channelDetail.sidebar.channelInformation.list.metadata' })}
              </InformationLabel>
              <InformationDetail>
                <Link role="button" onClick={openEditMetadataDialog}>
                  {intl.formatMessage({
                    id: 'chat.channelDetail.sidebar.channelInformation.list.metadata.btn.edit',
                  })}
                </Link>
              </InformationDetail>
            </>
          )}
        </InformationList>
      </Section>

      <Section>
        <Title>{intl.formatMessage({ id: 'chat.channelDetail.sidebar.manage.title' })}</Title>
        <InformationList>
          <InformationLabel css="display: block;" id="freeze-channel-label">
            {intl.formatMessage({ id: 'chat.channelDetail.sidebar.manage.freezeChannel' })}
            <InfoTooltip
              content={intl.formatMessage({ id: 'chat.channelDetail.sidebar.manage.freezeChannel.tooltipContent' })}
              css={`
                align-items: center;
                display: inline-flex;
                height: 20px;
                vertical-align: top;
              `}
            />
          </InformationLabel>
          <InformationDetail css="align-items: start;">
            <Toggle
              checked={channel.freeze}
              disabled={!canFreezeChannel || isUpdatingFreeze}
              onChange={(checked) => {
                toggleFreeze(checked);
              }}
              aria-labelledby="freeze-channel-label"
            />
          </InformationDetail>
        </InformationList>
      </Section>
    </Container>
  );
};
