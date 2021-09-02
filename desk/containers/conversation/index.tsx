import React, { useEffect, useCallback, useContext, useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { InlineNotification, toast, Link, LinkVariant } from 'feather';
import isEmpty from 'lodash/isEmpty';
import qs from 'qs';

import { deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { FacebookVerb, SocialTicketChannelTypes, TicketStatus } from '@constants';
import {
  parseTwitterDirectMessageEventAttachments,
  convertTwitterStatusTicketToMergedTwitterStatus,
} from '@desk/utils/twitterUtils';
import { useAuthorization, useShallowEqualSelector } from '@hooks';
import { useQueryString } from '@hooks/useQueryString';
import { useShowDialog } from '@hooks/useShowDialog';
import { isTicketMustBeFetchedUsingPlatformAPI } from '@selectors';
import { TicketActions, TicketActionToastMessage } from '@ui/components/TicketActionToastMessage';
import { ReconnectNotification } from '@ui/components/reconnectionNotification';

import { DeskChatLayout, DeskChatLayoutContext } from '../DeskChatLayout';
import {
  TicketSearchQuery,
  getTicketSearchURLQueryString,
  getTicketSearchQueryString,
  TicketSearchType,
  DefaultFilterItemId,
  getDefaultTicketSearchQueryParam,
} from '../TicketSearchInput';
import { IframeSidebar } from '../iframeSidebar';
import { QuickRepliesProvider } from '../settings/quickReplies/QuickRepliesContext';
import { TicketHeader } from '../ticketDetail/ticketHeader';
import { TicketInfoPanel } from '../ticketInfoPanel';
import { ChatPlatformAPI } from './chat/platformAPI';
import { ChatSendBird } from './chat/sendbird';
import { ChatSocial } from './chat/social';
import { ConversationTickets } from './conversationTickets';
import { ConversationContext } from './conversationTickets/conversationContext';
import { sendInquireTicketClosureMessage } from './sendInquireTicketClosureMessage';

const origin: DeskOrigin = 'conversation';

const NotificationWrapper = styled.div`
  width: 100%;
  position: absolute;
  bottom: 96px;
  padding: 0 16px;
`;

const EmptyTicketPlaceholder = styled.div`
  background-color: white;
  grid-row: top / bottom;
  grid-column: chat-thread-start / iframe-sidebar;
`;

const useSetAgentTypingStatus = () => {
  const dispatch = useDispatch();
  const typingStatus = useShallowEqualSelector((state) => state.conversation.typingStatus);
  return useCallback(
    (value: boolean) => {
      dispatch(deskActions.setTypingStatus({ ...typingStatus, agentTyping: value }));
    },
    [dispatch, typingStatus],
  );
};

export const Conversation: React.FC = () => {
  const intl = useIntl();
  const params = useParams<{ ticketId?: string }>();
  const history = useHistory();
  const dispatch = useDispatch();
  const showDialog = useShowDialog();
  const { isPermitted } = useAuthorization();
  const isAdmin = isPermitted(['desk.admin']);
  const [isExportNotificationShown, setIsExportNotificationShown] = useState(false);

  const { desk, ticket, isFetching, appId } = useSelector((state: RootState) => ({
    desk: state.desk,
    ticket: state.conversation.ticket,
    isFetching: state.conversation.isFetching,
    appId: state.applicationState.data?.app_id ?? '',
  }));
  const { project } = desk;
  const { id: ticketId = null, channelType: ticketChannelType = null } = ticket || {};

  const { conversationTickets: conversationTicketsContext } = useContext(ConversationContext);
  const { updateIsSearchMode, fetchSearchTickets } = conversationTicketsContext;

  const { q, updateParams, clearParams } = useQueryString<{ q: string }>({ q: '' });

  const setAgentTypingStatus = useSetAgentTypingStatus();
  const inAppMessagesRef = useRef<{ appendMessages: (messages: SendBirdSDKTicketMessage[]) => void } | null>(null);

  const fetchConversation = useCallback(
    (ticketIdParam: string) => {
      dispatch(
        deskActions.fetchConversationRequest({
          ticketId: Number(ticketIdParam),
          onSuccess: (conversation) => {
            const isMine = desk.agent.id === conversation?.recentAssignment?.agent.id;
            const isWip = conversation?.status2 === TicketStatus.WIP;
            if (isAdmin && !isMine && !isWip) {
              // Redirect to /tickets/ when it is not admins' ticket
              const queryParam = getDefaultTicketSearchQueryParam(DefaultFilterItemId.TicketID, ticketIdParam);
              history.replace(`/${appId}/desk/tickets/${ticketIdParam}?${queryParam}`);
            }
          },
          onFail: () => {
            if (appId) {
              history.replace(isAdmin ? `/${appId}/desk/tickets` : `/${appId}/desk/conversation`);
            }
          },
        }),
      );
    },
    [appId, desk.agent.id, dispatch, history, isAdmin],
  );

  useEffect(() => {
    dispatch(deskActions.resetConversationMessages());

    if (params.ticketId) {
      fetchConversation(params.ticketId);
    } else {
      // params.ticketId is undefined, which means no ticket is selected. We need to clear related redux state.
      dispatch(deskActions.resetConversation());
    }
  }, [dispatch, fetchConversation, params.ticketId]);

  useEffect(() => {
    return () => {
      /**
       * Reset conversation state on unmount to avoid side effects when the user revisits this menu.
       *
       * For example, the last ticket an agent worked on may be transferred to another agent. When the agent revisits
       * the menu, the ticket must not be accessible by the agent. Thus, we need to clear the selected ticket when
       * leaving the menu.
       */
      dispatch(deskActions.resetConversation());
    };
  }, [dispatch]);

  useEffect(() => {
    const queryParam = qs.parse(location.search, { ignoreQueryPrefix: true, parseArrays: false });

    if (!isEmpty(queryParam)) {
      updateIsSearchMode(true);
      updateParams({ q: qs.stringify(queryParam['q']) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeTicket = useCallback(() => {
    const openChannelHandler = new window.dashboardSB.ChannelHandler();
    openChannelHandler.onMessageReceived = (channel, message) => {
      if (channel.isOpenChannel() && channel.url === desk.project.openChannelUrl) {
        try {
          const deskEvent = JSON.parse(message['message']);
          switch (deskEvent.type as DeskEvent) {
            case 'TICKET_FACEBOOK_PAGE_MESSAGE_UPDATED':
              if (deskEvent.facebookPageMessage.ticket.id === ticketId) {
                dispatch(
                  deskActions.updateFacebookMessageRequest({
                    facebookMessage: deskEvent.facebookPageMessage,
                  }),
                );
              }
              break;

            case 'TICKET_FACEBOOK_PAGE_FEED_UPDATED':
              if (deskEvent.facebookPageFeedTicket.ticket.id !== ticketId) {
                return;
              }
              if (deskEvent.verb === FacebookVerb.ADD) {
                dispatch(deskActions.updateFacebookFeedsRequest(deskEvent.facebookPageFeedTicket.facebookPageFeed));
              } else if (deskEvent.verb === FacebookVerb.EDITED || deskEvent.verb === FacebookVerb.EDIT) {
                dispatch(
                  deskActions.updateFacebookFeedRequest({
                    feed: deskEvent.facebookPageFeedTicket.facebookPageFeed,
                    verb: deskEvent.verb,
                  }),
                );
              } else if (deskEvent.verb === FacebookVerb.HIDE) {
                dispatch(
                  deskActions.updateFacebookFeedRequest({
                    feed: deskEvent.facebookPageFeedTicket.facebookPageFeed,
                    verb: deskEvent.verb,
                  }),
                );
              } else if (deskEvent.verb === FacebookVerb.UNHIDE) {
                dispatch(
                  deskActions.updateFacebookFeedRequest({
                    feed: deskEvent.facebookPageFeedTicket.facebookPageFeed,
                    verb: deskEvent.verb,
                  }),
                );
              } else if (deskEvent.verb === FacebookVerb.REMOVE) {
                dispatch(
                  deskActions.updateFacebookFeedRequest({
                    feed: deskEvent.facebookPageFeedTicket.facebookPageFeed,
                    verb: deskEvent.verb,
                  }),
                );
              }
              break;

            case 'TICKET_FACEBOOK_PAGE_FEED_REACTION_UPDATED':
              if (deskEvent.facebookPageFeedTicket.ticket.id !== ticketId) {
                return;
              }
              dispatch(
                deskActions.updateFacebookFeedRequest({
                  feed: deskEvent.facebookPageFeedTicket.facebookPageFeed,
                  verb: deskEvent.verb,
                }),
              );
              break;

            case 'TICKET_TWITTER_DIRECT_MESSAGE_EVENT_UPDATED': {
              const newMessage: TwitterDirectMessageEvent = deskEvent.twitterDirectMessageEvent;
              if (newMessage.ticket.id === ticketId) {
                dispatch(
                  deskActions.upsertTwitterDirectMessageEvent(parseTwitterDirectMessageEventAttachments(newMessage)),
                );
              }
              break;
            }

            case 'TICKET_TWITTER_STATUS_TICKET_UPDATED': {
              if (deskEvent.twitterStatusTicket.ticket.id === ticketId) {
                const newMessage = convertTwitterStatusTicketToMergedTwitterStatus(deskEvent.twitterStatusTicket);
                // set isTemp to false in order to finalize the message is sent.
                newMessage.isTemp = false;

                dispatch(deskActions.updateTwitterStatusFromDeskEvent(newMessage));
              }
              break;
            }

            case 'TICKET_INSTAGRAM_COMMENT_UPDATED': {
              if (deskEvent.instagramCommentTicket.ticket.id === ticketId) {
                dispatch(deskActions.updateInstagramCommentFromDeskEvent(deskEvent.instagramCommentTicket));
              }
              break;
            }

            case 'TICKET_WHATSAPP_MESSAGE_UPDATED': {
              if (deskEvent.nexmoWhatsappMessage.ticket.id === ticketId) {
                dispatch(deskActions.updateWhatsAppMessageFromDeskEvent(deskEvent.nexmoWhatsappMessage));
              }
              break;
            }

            default:
              break;
          }
        } catch (_) {
          const deskEvent = JSON.parse(message['message']);
          throw `The error is occurred while processing open channel event of ${deskEvent.type} while receiving a message.`;
        }
      }
    };

    window.dashboardSB.addChannelHandler('FACEBOOK_HANDLER', openChannelHandler);
  }, [desk.project.openChannelUrl, dispatch, ticketId]);

  useEffect(() => {
    if (ticketChannelType && SocialTicketChannelTypes.includes(ticketChannelType)) {
      initializeTicket();
    }
  }, [initializeTicket, ticketChannelType]);

  const handleSearch = (queries: TicketSearchQuery[] | string) => {
    if (typeof queries === 'string') {
      updateParams({ q: queries });
      fetchSearchTickets({ offset: 0, query: queries });
    } else {
      const queryParamValue = getTicketSearchURLQueryString(queries);
      updateParams({ q: queryParamValue });
      fetchSearchTickets({ offset: 0, query: getTicketSearchQueryString(queries) });
    }
  };

  const handleCloseNotification = useCallback(() => {
    setIsExportNotificationShown(false);
  }, [setIsExportNotificationShown]);

  const handleResetSearch = useCallback(() => {
    clearParams();
  }, [clearParams]);

  const handleConversationActionChange: (payload: {
    action: TicketHeaderActionType;
    agent?: Agent;
    group?: AgentGroup<'listItem'>;
  }) => void = useCallback(
    ({ action, agent, group }) => {
      if (!ticket) {
        return;
      }
      switch (action) {
        case 'TRANSFER_TO_AGENT': {
          showDialog({
            dialogTypes: DialogType.AssignTransferTicketToAgent,
            dialogProps: { mode: 'TRANSFER', ticket, agent, origin },
          });
          return;
        }
        case 'ASSIGN_TO_AGENT': {
          showDialog({
            dialogTypes: DialogType.AssignTransferTicketToAgent,
            dialogProps: {
              mode: 'ASSIGN',
              ticket,
              agent,
              origin,
              onSuccess: (updatedTicket: Ticket) => {
                toast.success({
                  message: (
                    <TicketActionToastMessage
                      action={TicketActions.ASSIGNED}
                      ticketChannelName={updatedTicket.channelName}
                    />
                  ),
                });
              },
            },
          });
          return;
        }
        case 'REOPEN_TICKET': {
          showDialog({
            dialogTypes: DialogType.ReopenTicket,
            dialogProps: { ticket },
          });
          return;
        }
        case 'CLOSE_TICKET': {
          showDialog({
            dialogTypes: DialogType.CloseTicket,
            dialogProps: { ticket, origin },
          });
          return;
        }
        case 'INQUIRE_TICKET_CLOSURE': {
          showDialog({
            dialogTypes: DialogType.ConfirmEndOfChat,
            dialogProps: {
              project: desk.project,
              handleSubmit: async () => {
                const { groupChannel, userMessage } = await sendInquireTicketClosureMessage({
                  ticketId: ticket.id,
                  channelUrl: ticket.channelUrl,
                  message: desk.project.inquireCloseMessage,
                });

                inAppMessagesRef.current?.appendMessages([userMessage]);
                groupChannel.markAsRead();
                setAgentTypingStatus(false);
              },
            },
          });
          return;
        }
        case 'MOVE_TO_IN_PROGRESS': {
          showDialog({
            dialogTypes: DialogType.Confirm,
            dialogProps: {
              title: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.inProgress' }),
              description: '',
              confirmText: intl.formatMessage({ id: 'desk.dialogs.button.ok' }),
              cancelText: intl.formatMessage({ id: 'desk.dialogs.button.cancel' }),
              onConfirm: () => {
                dispatch(deskActions.moveTicketToWIPRequest(ticket));
              },
            },
          });
          return;
        }
        case 'MOVE_TO_IDLE': {
          showDialog({
            dialogTypes: DialogType.Confirm,
            dialogProps: {
              title: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.idle' }),
              description: '',
              confirmText: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.idle.button.confirm' }),
              cancelText: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.idle.button.cancel' }),
              onConfirm: () => {
                dispatch(deskActions.moveTicketToIdleRequest({ ticket, origin }));
              },
            },
          });
          return;
        }
        case 'ASSIGN_TICKET_TO_MYSELF': {
          showDialog({
            dialogTypes: DialogType.Confirm,
            dialogProps: {
              title: intl.formatMessage({ id: 'desk.assignTicketToMyself.dialog.title' }),
              description: intl.formatMessage({ id: 'desk.assignTicketToMyself.dialog.description' }),
              confirmText: intl.formatMessage({ id: 'desk.assignTicketToMyself.dialog.button.confirm' }),
              cancelText: intl.formatMessage({ id: 'desk.assignTicketToMyself.dialog.button.cancel' }),
              onConfirm: () => {
                dispatch(deskActions.assignTicketToMyselfRequest(ticket));
              },
            },
          });
          return;
        }
        case 'TRANSFER_TO_GROUP': {
          showDialog({
            dialogTypes: DialogType.AssignTransferTicketToGroup,
            dialogProps: { mode: 'TRANSFER', ticket, group, origin },
          });
          return;
        }
        case 'EXPORT_TICKET':
          showDialog({
            dialogTypes: DialogType.ExportTicket,
            dialogProps: {
              ticketID: ticket.id,
              onSuccess: () => {
                setIsExportNotificationShown(true);
              },
            },
          });
          return;
        default:
          return;
      }
    },
    [desk.project, dispatch, intl, setAgentTypingStatus, showDialog, ticket],
  );

  const renderChildren = (ticket: Ticket) => {
    // Pass key prop to the child component to reset the component state after changing tickets
    switch (ticket.channelType) {
      case 'SENDBIRD_JAVASCRIPT':
      case 'SENDBIRD_IOS':
      case 'SENDBIRD_ANDROID':
      case 'SENDBIRD':
        if (isTicketMustBeFetchedUsingPlatformAPI(ticket, desk.agent.id)) {
          return <ChatPlatformAPI key={ticket.id} ticket={ticket} />;
        }
        return <ChatSendBird key={ticket.id} ticket={ticket} ref={inAppMessagesRef} />;
      case 'FACEBOOK_CONVERSATION':
      case 'FACEBOOK_FEED':
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
      case 'TWITTER_STATUS':
      case 'INSTAGRAM_COMMENT':
      case 'WHATSAPP_MESSAGE':
        return <ChatSocial key={ticket.id} ticket={ticket as SocialTicket} />;
      default:
        return null;
    }
  };

  return (
    <DeskChatLayout>
      <DeskChatLayoutContext.Consumer>
        {({ ChatThreadGridItem, InformationSidebarGridItem }) => (
          <>
            <ConversationTickets
              initialSearchQuery={{ value: q, type: TicketSearchType.TagsSearch }}
              onSearch={handleSearch}
              onResetSearch={handleResetSearch}
            />
            {/* Show ticket header to draw grid lines even if a ticket hasn't been loaded. */}
            <TicketHeader
              key={ticket?.id ?? ''}
              isFetching={isFetching}
              project={project}
              ticket={ticket}
              agent={desk.agent}
              handleActionChange={handleConversationActionChange}
            />
            {ticket ? (
              <>
                <ChatThreadGridItem
                  styles={css`
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                  `}
                >
                  <ReconnectNotification />
                  <QuickRepliesProvider>{renderChildren(ticket)}</QuickRepliesProvider>
                  {isExportNotificationShown && (
                    <NotificationWrapper>
                      <InlineNotification
                        type="info"
                        message={intl.formatMessage(
                          { id: 'desk.dataExport.notification.dataExport.start' },
                          {
                            link: (
                              <Link href="../data_exports" variant={LinkVariant.Inline} useReactRouter={true}>
                                {intl.formatMessage({ id: 'desk.dataExport.title' })}
                              </Link>
                            ),
                          },
                        )}
                        onClose={handleCloseNotification}
                      />
                    </NotificationWrapper>
                  )}
                </ChatThreadGridItem>
                <InformationSidebarGridItem>
                  <TicketInfoPanel hasLinkToDetail={true} ticket={ticket} />
                </InformationSidebarGridItem>
              </>
            ) : (
              <EmptyTicketPlaceholder />
            )}
            <IframeSidebar ticketId={ticketId ?? undefined} />
          </>
        )}
      </DeskChatLayoutContext.Consumer>
    </DeskChatLayout>
  );
};
