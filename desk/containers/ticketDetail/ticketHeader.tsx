import { memo, useMemo, useContext, useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import copy from 'copy-to-clipboard';
import { cssVariables, Button, Icon, OverflowMenu, toast } from 'feather';
import { ResizeObserver } from 'resize-observer';

import { TicketStatus } from '@constants';
import { useLatestValue, useAuthorization } from '@hooks';
import { TicketStatusLozenge } from '@ui/components';
import { getTicketURL } from '@utils';
import { logException } from '@utils/logException';

import { DeskChatLayoutContext } from '../DeskChatLayout';
import { TicketHeaderTag } from './TicketHeaderTag';
import { TicketTagDropdown } from './TicketTagDropdown';
import { TicketHeaderAction } from './ticketHeaderAction';
import { TicketHeaderTransferActions } from './ticketHeaderTransferActions';

type Props = {
  project: Project;
  ticket?: Ticket | null;
  agent: AgentDetail;
  isFetching: boolean;

  handleActionChange: (payload: {
    action: TicketHeaderActionType;
    agent?: Agent;
    group?: AgentGroup<'listItem'>;
  }) => void;
};

const Wrapper = styled.div<{ hasTagRow: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: repeat(${({ hasTagRow }) => (hasTagRow ? 2 : 1)}, auto);
  grid-gap: 8px 0;
  grid-auto-flow: column;
  padding: 12px 16px;
`;

const TicketInfo = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 32px;
`;

const TicketDetailHeaderAction = styled.div`
  grid-column: -2 / -1;
  grid-row: 1 / 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  padding-left: 32px;
`;

const TicketNameText = styled.div`
  height: 18px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  color: ${cssVariables('neutral-10')};
  letter-spacing: -0.15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TicketSocialIcon = styled.div`
  margin-right: 8px;
  height: 16px;
`;

const SocialCustomerChatLabel = styled.div`
  height: 20px;
  padding: 0 8px;
  border-radius: 2px;
  border: 1px solid ${cssVariables('neutral-3')};
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  color: ${cssVariables('neutral-6')};
  margin-left: 8px;
  display: flex;
  align-items: center;
`;

const TagsWrapper = styled.div`
  margin-bottom: -8px;

  & > * {
    margin-left: 0 !important;
    margin-bottom: 8px;

    &:not(:last-child) {
      margin-right: 4px;
    }
  }
`;

const InlineTagsWrapper = styled(TagsWrapper)<{ isHidden: boolean }>`
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  display: flex;
  flex-wrap: nowrap;
  padding-left: 4px;
  overflow: hidden;

  ${({ isHidden }) => isHidden && 'visibility: hidden;'}
`;

const TagRow = styled(TagsWrapper)`
  grid-column: 1 / -1;
  grid-row: 2 / 3;
  padding-right: 184px;
  display: flex;
  flex-wrap: wrap;
`;

export const TicketHeader = memo<Props>(({ project, isFetching, ticket, agent, handleActionChange }) => {
  const { transferEnabled, closeTicketWithoutConfirmation } = project;
  const { isPermitted } = useAuthorization();
  const isAdmin = isPermitted(['desk.admin']);
  const isAgent = !isAdmin;
  const intl = useIntl();
  const { ChatTitleBarGridItem } = useContext(DeskChatLayoutContext);
  const [hasTagRow, setHasTagRow] = useState(false);
  const inlineTagsWrapperRef = useRef<HTMLDivElement>(null);
  const latestHasTagRow = useLatestValue(hasTagRow);

  const { id: ticketId, data = null, channelType = null, recentAssignment = null, status2 = null, channelName = null } =
    ticket || {};

  const [ticketTags, setTicketTags] = useState(ticket?.tags ?? []);

  const updateHasTagRow = useCallback(() => {
    if (inlineTagsWrapperRef.current) {
      const node = inlineTagsWrapperRef.current;

      // If the node is horizontally overflowed, tags should be rendered in a separate row.
      const shouldHaveTagRow = node.scrollWidth > node.clientWidth;
      if (shouldHaveTagRow !== latestHasTagRow.current) {
        setHasTagRow(shouldHaveTagRow);
      }
    }
  }, [latestHasTagRow]);

  const resizeObserverRef = useRef<ResizeObserver>(
    new ResizeObserver((entries) => {
      if (entries.length > 0) {
        updateHasTagRow();
      }
    }),
  );

  useEffect(() => {
    if (inlineTagsWrapperRef.current) {
      const resizeObserver = resizeObserverRef.current;
      resizeObserver.observe(inlineTagsWrapperRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  useLayoutEffect(() => {
    updateHasTagRow();
  }, [ticketTags, updateHasTagRow]);

  const renderCustomerChatLabel = useMemo(() => {
    if (channelType === 'FACEBOOK_CONVERSATION' && data) {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.social.source === 'customer_chat_plugin') {
          // FIXME: needs to be changed with key
          return <SocialCustomerChatLabel>CUSTOMER CHAT</SocialCustomerChatLabel>;
        }
      } catch (e) {
        logException({
          error: new Error('Failed to parse JSON in ticket.data'),
          context: {
            where: 'JSONParseFacebookTicketData',
            ticketData: data,
          },
        });
      }
      return null;
    }
  }, [channelType, data]);

  const isAssignedToCurrentAgent = recentAssignment?.agent.id === agent.id;
  const isTicketWip = status2 === TicketStatus.WIP;
  const isTicketClosed = status2 === TicketStatus.CLOSED;

  const socialIcon = (() => {
    switch (channelType) {
      case 'FACEBOOK_CONVERSATION':
      case 'FACEBOOK_FEED':
        return <Icon icon="facebook" size={16} color={cssVariables('neutral-9')} />;
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
      case 'TWITTER_STATUS':
        return <Icon icon="twitter" size={16} color={cssVariables('neutral-9')} />;
      case 'INSTAGRAM_COMMENT':
        return <Icon icon="instagram" size={16} color={cssVariables('neutral-9')} />;
      case 'WHATSAPP_MESSAGE':
        return <Icon icon="whatsapp" size={16} color={cssVariables('neutral-9')} />;
      default:
        return null;
    }
  })();

  const ticketHeaderAction = useMemo(() => {
    if (isTicketClosed) {
      return (
        <Button
          buttonType="secondary"
          size="small"
          icon={<Icon icon="reopen" size={20} />}
          onClick={() => handleActionChange({ action: 'REOPEN_TICKET' })}
          data-test-id="ReopenButton"
        >
          {intl.formatMessage({ id: 'desk.tickets.ticketHeader.reopen.button' })}
        </Button>
      );
    }

    if (ticket) {
      return (
        <TicketHeaderAction
          ticket={ticket}
          agent={agent}
          isAdmin={isAdmin}
          closeTicketWithoutConfirmation={closeTicketWithoutConfirmation}
          handleActionChange={handleActionChange}
        />
      );
    }

    return null;
  }, [agent, closeTicketWithoutConfirmation, handleActionChange, intl, isAdmin, isTicketClosed, ticket]);

  const ticketHeaderOverflowMenuItems = useMemo(() => {
    const copyUrlMenuItem = {
      label: intl.formatMessage({ id: 'desk.tickets.action.lbl.copyUrl' }),
      onClick: () => {
        if (ticket) {
          copy(getTicketURL(ticket.id, isAdmin));
          toast.success({
            message: intl.formatMessage({ id: 'desk.tickets.action.lbl.copyUrl.success' }),
          });
          return;
        }
      },
    };
    const exportTicketMenuItem = {
      label: intl.formatMessage({ id: 'desk.tickets.action.lbl.exportToCSV' }),
      onClick: () => {
        handleActionChange({ action: 'EXPORT_TICKET' });
      },
    };

    return isAdmin ? [exportTicketMenuItem, copyUrlMenuItem] : [copyUrlMenuItem];
  }, [handleActionChange, intl, isAdmin, ticket]);

  const renderedTags = useMemo(
    () =>
      ticketId != null &&
      ticketTags.map((tag) => (
        <TicketHeaderTag
          key={tag.id}
          ticketId={ticketId}
          tag={tag}
          onRemoveComplete={(removedTag) =>
            setTicketTags((currentTags) => currentTags.filter((item) => item.id !== removedTag.id))
          }
        />
      )),
    [ticketTags, ticketId],
  );

  const ticketInfo = ticket ? (
    <>
      {socialIcon && <TicketSocialIcon>{socialIcon}</TicketSocialIcon>}
      <TicketNameText title={channelName || undefined}>{channelName}</TicketNameText>
      {renderCustomerChatLabel}
      {status2 && <TicketStatusLozenge ticketStatus={status2} css="margin-left: 8px;" />}
    </>
  ) : null;

  const ticketDetailHeaderAction = useMemo(() => {
    const handleTagAdded = (tag: TicketTag) => setTicketTags((currentTags) => [...currentTags, tag]);
    return ticket ? (
      <>
        <TicketTagDropdown
          css="margin-right: 4px;"
          ticketId={ticketId}
          currentTicketTags={ticketTags}
          onTagAdded={handleTagAdded}
        />
        <OverflowMenu
          iconButtonProps={{ buttonType: 'secondary' }}
          css="margin-right: 8px;"
          items={ticketHeaderOverflowMenuItems}
        />
        {!isTicketWip && !isTicketClosed && (isAdmin || (isAgent && isAssignedToCurrentAgent)) && (
          <TicketHeaderTransferActions
            ticket={ticket}
            isAdmin={isAdmin}
            isAgent={isAgent}
            isFetching={isFetching}
            transferEnabled={transferEnabled}
            handleActionChange={handleActionChange}
          />
        )}
        {ticketHeaderAction}
      </>
    ) : null;
  }, [
    handleActionChange,
    isAdmin,
    isAgent,
    isAssignedToCurrentAgent,
    isFetching,
    isTicketClosed,
    isTicketWip,
    ticket,
    ticketHeaderAction,
    ticketHeaderOverflowMenuItems,
    ticketId,
    ticketTags,
    transferEnabled,
  ]);

  return (
    <ChatTitleBarGridItem>
      <Wrapper hasTagRow={hasTagRow}>
        <TicketInfo>{ticketInfo}</TicketInfo>
        <InlineTagsWrapper ref={inlineTagsWrapperRef} isHidden={hasTagRow}>
          {renderedTags}
        </InlineTagsWrapper>
        <TicketDetailHeaderAction>{ticketDetailHeaderAction}</TicketDetailHeaderAction>
        {hasTagRow && <TagRow>{renderedTags}</TagRow>}
      </Wrapper>
    </ChatTitleBarGridItem>
  );
});

TicketHeader.displayName = 'TicketHeader';
