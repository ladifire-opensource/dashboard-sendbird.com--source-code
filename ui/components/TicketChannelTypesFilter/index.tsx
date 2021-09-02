import { useEffect, useState, useMemo, memo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { TreeData, TreeSelect, cssVariables, Subtitles, Icon, transitionDefault } from 'feather';
import isEqual from 'lodash/isEqual';

export const allChannelTypes: TicketChannelType[] = [
  'SENDBIRD',
  'SENDBIRD_JAVASCRIPT',
  'SENDBIRD_IOS',
  'SENDBIRD_ANDROID',
  'FACEBOOK_CONVERSATION',
  'FACEBOOK_FEED',
  'TWITTER_DIRECT_MESSAGE_EVENT',
  'TWITTER_STATUS',
  'INSTAGRAM_COMMENT',
  'WHATSAPP_MESSAGE',
];
export const allSendBirdChannelTypes: SendBirdTicketChannelType[] = [
  'SENDBIRD',
  'SENDBIRD_ANDROID',
  'SENDBIRD_IOS',
  'SENDBIRD_JAVASCRIPT',
];
export const allFacebookChannelTypes: FacebookTicketChannelType[] = ['FACEBOOK_FEED', 'FACEBOOK_CONVERSATION'];
export const allTwitterChannelTypes: TwitterTicketChannelType[] = ['TWITTER_DIRECT_MESSAGE_EVENT', 'TWITTER_STATUS'];
export const allInstagramChannelTypes: InstagramTicketChannelType[] = ['INSTAGRAM_COMMENT'];
export const whatsAppChannelType: WhatsAppTicketChannelType = 'WHATSAPP_MESSAGE';

const ToggleContentWrapper = styled.div<{ disabled: boolean; isOpen: boolean }>`
  display: flex;
  align-items: center;
  padding-top: 6px;
  padding-right: 4px;
  padding-left: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;

  & > div {
    color: ${({ isOpen, disabled }) => {
      if (disabled) {
        return cssVariables('neutral-5');
      }
      if (isOpen) {
        return cssVariables('purple-7');
      }
      return cssVariables('neutral-10');
    }};
  }
`;

const PrefixItem = styled.div<{ isChecked: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 14px 16px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  color: ${({ isChecked }) => (isChecked ? cssVariables('purple-7') : cssVariables('neutral-10'))};
  cursor: pointer;
  white-space: nowrap;
  ${Subtitles['subtitle-01']}
`;

type Props = {
  channelTypes: TicketChannelType[];
  width?: string | number;
  disabled?: boolean;
  onSelect: (values: TicketChannelType[]) => void;
  className?: string;
};

export const TicketChannelTypesFilter = memo<Props>(
  ({ channelTypes, width, disabled = false, onSelect, className }) => {
    const intl = useIntl();
    const [selectedNodes, setSelectedNodes] = useState<TreeData[]>([]);
    const [isAllNodesSelected, setIsAllNodesSelected] = useState(false);

    const sendbirdChannelTypeTreeData: TreeData = useMemo(
      () => ({
        label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.inAppChat' }),
        value: 'SENDBIRD_ALL',
        icon: 'mobile-application-filled',
        children: [
          {
            label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.inAppChat.web' }),
            value: 'SENDBIRD_JAVASCRIPT',
            icon: 'mobile-application-filled',
          },
          {
            label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.inAppChat.ios' }),
            value: 'SENDBIRD_IOS',
            icon: 'mobile-application-filled',
          },
          {
            label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.inAppChat.android' }),
            value: 'SENDBIRD_ANDROID',
            icon: 'mobile-application-filled',
          },
          {
            label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.inAppChat.others' }),
            value: 'SENDBIRD',
            icon: 'mobile-application-filled',
          },
        ],
      }),
      [intl],
    );

    const twitterChannelTypeTreeData: TreeData = useMemo(
      () => ({
        label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.twitter' }),
        value: 'TWITTER_ALL',
        icon: 'twitter',
        children: [
          {
            label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.twitter.tweets' }),
            value: 'TWITTER_STATUS',
            icon: 'twitter',
          },
          {
            label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.twitter.directMessages' }),
            value: 'TWITTER_DIRECT_MESSAGE_EVENT',
            icon: 'twitter',
          },
        ],
      }),
      [intl],
    );

    const facebookChannelTypeTreeData: TreeData = useMemo(
      () => ({
        label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.facebook' }),
        value: 'FACEBOOK_ALL',
        icon: 'facebook',
        children: [
          {
            label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.facebook.messages' }),
            value: 'FACEBOOK_CONVERSATION',
            icon: 'facebook',
          },
          {
            label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.facebook.posts' }),
            value: 'FACEBOOK_FEED',
            icon: 'facebook',
          },
        ],
      }),
      [intl],
    );

    const instagramChannelTypeTreeData: TreeData = useMemo(
      () => ({
        label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.instagram' }),
        value: 'INSTAGRAM_ALL',
        icon: 'instagram',
        children: [
          {
            label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.instagram.comments' }),
            value: 'INSTAGRAM_COMMENT',
            icon: 'instagram',
          },
        ],
      }),
      [intl],
    );

    const whatsAppChannelTypeTreeData: TreeData = useMemo(
      () => ({
        label: intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.whatsapp' }),
        value: 'WHATSAPP_MESSAGE',
        icon: 'whatsapp',
      }),
      [intl],
    );

    const ticketChannelFilterTreeData: TreeData[] = useMemo(
      () => [
        sendbirdChannelTypeTreeData,
        twitterChannelTypeTreeData,
        facebookChannelTypeTreeData,
        instagramChannelTypeTreeData,
        whatsAppChannelTypeTreeData,
      ],
      [
        facebookChannelTypeTreeData,
        instagramChannelTypeTreeData,
        sendbirdChannelTypeTreeData,
        twitterChannelTypeTreeData,
        whatsAppChannelTypeTreeData,
      ],
    );

    const handlePrefixItemClick = () => {
      !isAllNodesSelected && onSelect(allChannelTypes);
    };

    const handleSelect = (selectedNodes: TreeData[], isAllNodesSelected: boolean) => {
      const values =
        selectedNodes.length === 0 || isAllNodesSelected
          ? allChannelTypes
          : selectedNodes.flatMap((selectedNode) => {
              if (selectedNode.value === 'SENDBIRD_ALL') {
                return allSendBirdChannelTypes;
              }
              if (selectedNode.value === 'FACEBOOK_ALL') {
                return allFacebookChannelTypes;
              }
              if (selectedNode.value === 'TWITTER_ALL') {
                return allTwitterChannelTypes;
              }
              if (selectedNode.value === 'INSTAGRAM_ALL') {
                return allInstagramChannelTypes;
              }
              if (selectedNode.value === 'WHATSAPP_MESSAGE') {
                return whatsAppChannelType;
              }
              return selectedNode.value as TicketChannelType;
            });

      onSelect(values);
    };

    const renderToggleContent = ({ isOpen }) => (
      <ToggleContentWrapper disabled={disabled} isOpen={isOpen} data-test-id="ToggleContent">
        {intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.allChannels' })}
      </ToggleContentWrapper>
    );

    useEffect(() => {
      if (channelTypes.length === 0 || isEqual(channelTypes, allChannelTypes)) {
        setSelectedNodes(ticketChannelFilterTreeData);
        setIsAllNodesSelected(true);
      } else {
        const flatten = (treeData: TreeData[]): TreeData[] =>
          treeData.flatMap((node) => {
            if (node.children) {
              const children = flatten(node.children);
              return [{ ...node, children }, ...children];
            }
            return node;
          });

        const getIsAllChannelTypesSelected = (
          channelTypes: TicketChannelType[],
          allChannelTypes: TicketChannelType[],
        ) => allChannelTypes.every((x) => channelTypes.includes(x));

        const nodeList = flatten(ticketChannelFilterTreeData);
        let selectedNodes = nodeList.filter((node) => channelTypes.some((channelType) => node.value === channelType));

        if (getIsAllChannelTypesSelected(channelTypes, allSendBirdChannelTypes)) {
          selectedNodes = selectedNodes
            .filter(
              (selectedNode) => !allSendBirdChannelTypes.some((channelType) => selectedNode.value === channelType),
            )
            .concat(sendbirdChannelTypeTreeData);
        }
        if (getIsAllChannelTypesSelected(channelTypes, allTwitterChannelTypes)) {
          selectedNodes = selectedNodes
            .filter((selectedNode) => !allTwitterChannelTypes.some((channelType) => selectedNode.value === channelType))
            .concat(twitterChannelTypeTreeData);
        }
        if (getIsAllChannelTypesSelected(channelTypes, allFacebookChannelTypes)) {
          selectedNodes = selectedNodes
            .filter(
              (selectedNode) => !allFacebookChannelTypes.some((channelType) => selectedNode.value === channelType),
            )
            .concat(facebookChannelTypeTreeData);
        }
        if (getIsAllChannelTypesSelected(channelTypes, allInstagramChannelTypes)) {
          selectedNodes = selectedNodes
            .filter(
              (selectedNode) => !allInstagramChannelTypes.some((channelType) => selectedNode.value === channelType),
            )
            .concat(instagramChannelTypeTreeData);
        }

        setSelectedNodes(selectedNodes);
        setIsAllNodesSelected(
          ticketChannelFilterTreeData.every((ancestor) =>
            selectedNodes.some((selectedNode) => ancestor.value === selectedNode.value),
          ),
        );
      }
    }, [
      channelTypes,
      facebookChannelTypeTreeData,
      instagramChannelTypeTreeData,
      sendbirdChannelTypeTreeData,
      ticketChannelFilterTreeData,
      twitterChannelTypeTreeData,
    ]);

    return (
      <TreeSelect
        className={className}
        treeData={ticketChannelFilterTreeData}
        selectedNodes={selectedNodes}
        treeDefaultExpandAll={true}
        disabled={disabled}
        toggleRenderer={isAllNodesSelected ? renderToggleContent : undefined}
        prefixItem={
          <PrefixItem isChecked={isAllNodesSelected} onClick={handlePrefixItemClick}>
            {intl.formatMessage({ id: 'ui.ticketChannelTypeFilter.allChannels' })}
            {isAllNodesSelected && <Icon icon="done" size={20} color={cssVariables('purple-7')} />}
          </PrefixItem>
        }
        onSelect={handleSelect}
        width={width}
        toggleButtonStyles={css`
          &:hover {
            &:hover {
              ${ToggleContentWrapper} {
                color: ${cssVariables('purple-7')};
                transition: 0.2s color ${transitionDefault};
              }
            }
          }
        `}
      />
    );
  },
);
