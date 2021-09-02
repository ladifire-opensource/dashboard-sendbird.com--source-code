import React, { useCallback, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled, { css } from 'styled-components';

import { cssVariables, Dropdown, Icon, toast, Link, DropdownProps } from 'feather';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment-timezone';

import { deskActions } from '@actions';
import { TicketPriority, SocialTicketChannelTypes } from '@constants';
import { getTwitterStatusURL } from '@desk/utils/twitterUtils';
import { useTickets, useAuthorization } from '@hooks';
import { CollapsibleSection, PriorityBadge } from '@ui/components';

import { TicketsContext } from '../tickets/ticketsContext';
import { RelatedChatContext } from './RelatedChat/RelatedChatContext';

type Props = {
  ticket: Ticket;
};

type PrioritySelectorItem = {
  label: string;
  priority: TicketPriority;
};

const CustomFieldLabel = styled.label`
  width: 88px;
  font-size: 14px;
  line-height: 1.43;
  color: ${cssVariables('neutral-6')};
  margin-bottom: 0;
  margin-right: 16px;
  word-break: break-word;
`;

const CustomField = styled.div`
  flex: 1;
  min-width: 0;
`;

const InformationList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 14px;
`;

const InformationItem = styled.li`
  display: flex;
  align-items: center;

  & + & {
    margin-top: 12px;
  }
`;

const StyledDropdown = styled((props: DropdownProps<PrioritySelectorItem>) => <Dropdown {...props} />)`
  height: 24px;
  padding-left: 8px;
  margin-left: -8px;
`;

const TicketSocialItemLink = styled.a`
  display: flex;
  align-items: center;
  position: relative;
  min-width: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const TicketSocialItemLinkText = styled.div`
  line-height: 16px;
  height: 16px;
  color: ${cssVariables('purple-7')};
  margin-right: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const RelatedChatList = styled.div`
  flex: 1;

  a {
    display: flex;
    line-height: 20px;
  }

  a + a {
    margin-top: 4px;
  }
`;

export const PrioritySelector: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { updateTicket } = useTickets();
  const { updateTicketInList } = useContext(TicketsContext);
  const priorityList: PrioritySelectorItem[] = [
    {
      priority: TicketPriority.URGENT,
      label: intl.formatMessage({ id: 'ui.priority.urgent' }),
    },
    {
      priority: TicketPriority.HIGH,
      label: intl.formatMessage({ id: 'ui.priority.high' }),
    },
    {
      priority: TicketPriority.MEDIUM,
      label: intl.formatMessage({ id: 'ui.priority.medium' }),
    },
    {
      priority: TicketPriority.LOW,
      label: intl.formatMessage({ id: 'ui.priority.low' }),
    },
  ];

  const getSelectedPriorityItem = useCallback(
    () => priorityList.find((item) => item.priority === ticket.priority) || priorityList[2],
    [priorityList, ticket],
  );

  const handleChangeSelected = useCallback(
    async (selectedItem: PrioritySelectorItem | null) => {
      const prevSelectedItem = getSelectedPriorityItem();
      if (selectedItem && prevSelectedItem.priority !== selectedItem.priority) {
        try {
          const updatedTicket = await updateTicket(ticket.id, { priority: selectedItem.priority });
          if (updatedTicket) {
            updateTicketInList(updatedTicket);
            dispatch(deskActions.updateTicketDetail(updatedTicket));

            toast.info({
              message: intl.formatMessage(
                { id: 'desk.tickets.ticketInfoPanel.toast.changePriority.success' },
                {
                  changedPriority: selectedItem.label,
                },
              ),
            });
          }
        } catch (err) {
          toast.error({
            message: intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.toast.changePriority.fail' }),
          });
        }
      }
      return;
    },
    [updateTicket, ticket.id, updateTicketInList, dispatch, intl, getSelectedPriorityItem],
  );

  return (
    <StyledDropdown
      placement="bottom-start"
      variant="inline"
      items={priorityList}
      size="small"
      selectedItem={getSelectedPriorityItem()}
      itemToString={(item) => item.priority}
      itemToElement={(item) => <PriorityBadge key={item.priority} priority={item.priority} showLabel={true} />}
      onItemSelected={handleChangeSelected}
      toggleRenderer={({ selectedItem }) => {
        if (selectedItem) {
          return <PriorityBadge key={selectedItem.priority} priority={selectedItem.priority} showLabel={true} />;
        }
      }}
    />
  );
};

export const SocialInformation: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const intl = useIntl();
  const { data = null, channelType = null, twitterUser = null, instagramUser = null } = ticket || {};
  const isSocialTicket = useMemo(() => channelType && SocialTicketChannelTypes.includes(channelType) && data, [
    channelType,
    data,
  ]);

  const ticketSocialName = useMemo(() => {
    switch (channelType) {
      case 'FACEBOOK_CONVERSATION':
      case 'FACEBOOK_FEED':
        return (ticket as FacebookTicket).facebookPage.name;
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
      case 'TWITTER_STATUS':
        return (ticket as TwitterTicket).twitterUser.name;
      case 'INSTAGRAM_COMMENT':
        return (ticket as InstagramTicket).instagramUser.username;
      default:
        return '';
    }
  }, [ticket, channelType]);

  const socialLabelId = useMemo(() => {
    switch (channelType) {
      case 'FACEBOOK_CONVERSATION':
      case 'FACEBOOK_FEED':
        return 'desk.tickets.ticketInfoPanel.ticketInfo.lbl.socialName.facebook';
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
      case 'TWITTER_STATUS':
        return 'desk.tickets.ticketInfoPanel.ticketInfo.lbl.socialName.twitter';
      case 'INSTAGRAM_COMMENT':
        return 'desk.tickets.ticketInfoPanel.ticketInfo.lbl.socialName.instagram';
      default:
        return '';
    }
  }, [channelType]);

  const renderSocialLinkText = useMemo(() => {
    if (!isSocialTicket || !data) {
      return null;
    }
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      // If it fails to parse data, hide the social media link.
      return null;
    }

    let { permalink } = parsedData.social;
    let socialLinkText = '';
    switch (channelType) {
      case 'FACEBOOK_FEED': {
        if (parsedData.social.source === 'post') {
          socialLinkText = intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.url.facebookPost' });
        } else if (parsedData.social.source === 'comment') {
          socialLinkText = intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.url.facebookComment' });
        }
        break;
      }

      case 'FACEBOOK_CONVERSATION': {
        socialLinkText = intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.url.facebookMessage' });
        break;
      }

      case 'TWITTER_DIRECT_MESSAGE_EVENT': {
        socialLinkText = intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.url.twitterDM' });
        if (parsedData.social.source && parsedData.social.source.sender_id) {
          permalink = `https://twitter.com/messages/compose?recipient_id=${parsedData.social.source.sender_id}`;
        }
        break;
      }

      case 'TWITTER_STATUS': {
        socialLinkText = intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.url.twitterTweet' });
        if (twitterUser && parsedData.social.source && parsedData.social.source.status_id) {
          permalink = getTwitterStatusURL({ statusId: parsedData.social.source.status_id });
        }
        break;
      }

      case 'INSTAGRAM_COMMENT': {
        socialLinkText = intl.formatMessage({ id: 'desk.tickets.ticketHeader.socialLink.lbl.instagramComment' });
        if (instagramUser && parsedData.social.source && parsedData.social.source.shortcode) {
          permalink = `https://instagram.com/p/${parsedData.social.source.shortcode}`;
        }
        break;
      }
      // no default
    }

    if (socialLinkText !== '' && permalink) {
      return (
        <TicketSocialItemLink target="_blank" href={permalink} title={socialLinkText}>
          <TicketSocialItemLinkText>{socialLinkText}</TicketSocialItemLinkText>
          <Icon icon="open-in-new" size={14} color={cssVariables('purple-7')} css="flex: none;" />
        </TicketSocialItemLink>
      );
    }
    return '';
  }, [channelType, data, intl, twitterUser, isSocialTicket, instagramUser]);

  if (!isSocialTicket || isEmpty(ticketSocialName)) {
    return null;
  }
  return (
    <>
      <InformationItem>
        <CustomFieldLabel>{intl.formatMessage({ id: socialLabelId })}</CustomFieldLabel>
        <CustomField>{ticketSocialName}</CustomField>
      </InformationItem>
      <InformationItem>
        <CustomFieldLabel>
          {intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.lbl.url' })}
        </CustomFieldLabel>
        <CustomField>{renderSocialLinkText}</CustomField>
      </InformationItem>
    </>
  );
};

export const TicketInformation: React.FC<Props> = ({ ticket }) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const issuedAtString = ticket.issuedAt ? moment(ticket.issuedAt).format('lll') : '';
  const { open } = useContext(RelatedChatContext);

  const handleRelatedChatLinkClick = (relatedChannel: RelatedChannel) => () => {
    open(relatedChannel);
  };

  return (
    <CollapsibleSection title={intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.title' })}>
      <InformationList>
        <InformationItem>
          <CustomFieldLabel>
            {intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.lbl.created' })}
          </CustomFieldLabel>
          <CustomField>{issuedAtString}</CustomField>
        </InformationItem>
        {ticket.relatedChannels && (
          <InformationItem>
            <CustomFieldLabel
              css={css`
                display: flex;
                align-self: flex-start;
              `}
            >
              {intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.lbl.relatedChat' })}
            </CustomFieldLabel>
            <RelatedChatList>
              {(JSON.parse(ticket.relatedChannels) as RelatedChannel[]).map((relatedChannel) => (
                <Link
                  key={relatedChannel.channel_url}
                  role="button"
                  onClick={handleRelatedChatLinkClick(relatedChannel)}
                >
                  {relatedChannel.name}
                </Link>
              ))}
            </RelatedChatList>
          </InformationItem>
        )}
        <SocialInformation ticket={ticket} />
        <InformationItem>
          <CustomFieldLabel>
            {intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.lbl.priority' })}
          </CustomFieldLabel>
          <CustomField>
            {isPermitted(['desk.agent']) ? (
              <PriorityBadge priority={ticket.priority} showLabel={true} />
            ) : (
              <PrioritySelector ticket={ticket} />
            )}
          </CustomField>
        </InformationItem>
      </InformationList>
    </CollapsibleSection>
  );
};
