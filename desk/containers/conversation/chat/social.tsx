import React, { useEffect, useReducer, Reducer, useRef, useCallback, useContext } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import styled from 'styled-components';

import findLast from 'lodash/findLast';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import { commonActions, deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { TicketStatus } from '@constants';
import { ChatBubbleMenuPopperBoundariesElementContext } from '@desk/components/chatBubble/chatBubbleRenderer';
import { useScrollPositionRestoration } from '@hooks';
import {
  sortedFacebookMessages,
  sortedFacebookFeeds,
  sortedTwitterDirectMessages,
  sortedTwitterStatuses,
  sortedInstagramComments,
} from '@selectors';
import { ZIndexes } from '@ui';
import { SpinnerFull } from '@ui/components';
import { isEqualIgnoreCase } from '@utils';
import { logException } from '@utils/logException';

import { ConversationContext } from '../conversationTickets/conversationContext';
import { SocialInput } from '../input';
import { SocialMessages, SocialMessagesRef } from '../messages';

const mapStateToProps = (state: RootState) => {
  return {
    isFetchingConversation: state.conversation.isFetching,
    isFetchingMessages: state.conversation.isFetchingMessages,
    initialOrNextFetchedTimestamp: state.conversation.initialOrNextFetchedTimestamp,
    facebookMessages: sortedFacebookMessages(state.conversation),
    facebookFeeds: sortedFacebookFeeds(state.conversation),
    twitterDirectMessages: sortedTwitterDirectMessages(state.conversation),
    twitterStatuses: sortedTwitterStatuses(state),
    instagramComments: sortedInstagramComments(state.conversation),
    whatsAppMessages: state.conversation.whatsAppMessages,
    customerTwitterUser: state.twitter.twitterUser,
    agent: state.desk.agent,
    project: state.desk.project,
  };
};

const mapDispatchToProps = {
  showDialogsRequest: commonActions.showDialogsRequest,
  showImagePreviewRequest: commonActions.showImagePreviewRequest,

  // messenger
  fetchFacebookMessagesRequest: deskActions.fetchFacebookMessagesRequest,
  sendFacebookMessageRequest: deskActions.sendFacebookMessageRequest,
  updateConversationTicketAssignmentRequest: deskActions.updateConversationTicketAssignmentRequest,

  // feed
  fetchFacebookFeedsRequest: deskActions.fetchFacebookFeedsRequest,
  createFacebookFeedRequest: deskActions.createFacebookFeedRequest,
  editFacebookFeedRequest: deskActions.editFacebookFeedRequest,
  deleteFacebookFeedRequest: deskActions.deleteFacebookFeedRequest,

  facebookFeedLikeRequest: deskActions.facebookFeedLikeRequest,
  facebookFeedUnlikeRequest: deskActions.facebookFeedUnlikeRequest,

  markAsReadRequest: deskActions.markAsReadRequest,

  // twitter
  fetchTwitterDirectMessages: deskActions.fetchTwitterDirectMessagesRequest,
  createTwitterDirectMessageEvent: deskActions.createTwitterDirectMessageRequest,
  deleteTwitterDirectMessageEventRequest: deskActions.deleteTwitterDirectMessageEventRequest,
  fetchTwitterStatuses: deskActions.fetchTwitterStatusesRequest,
  createTwitterStatus: deskActions.createTwitterStatusRequest,

  // instagram
  fetchInstagramCommentsRequest: deskActions.fetchInstagramCommentsRequest,
  createInstagramCommentRequest: deskActions.createInstagramCommentRequest,
  deleteInstagramCommentRequest: deskActions.deleteInstagramCommentRequest,

  // whatsapp
  fetchWhatsAppMessagesRequest: deskActions.fetchWhatsAppMessagesRequest,
  createWhatsAppMessageRequest: deskActions.createWhatsAppMessageRequest,

  // conv
  fetchConversationRequest: deskActions.fetchConversationRequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;
type ActionProps = typeof mapDispatchToProps;
type OwnProps = { ticket: SocialTicket };

type Props = StoreProps & ActionProps & OwnProps;

type State = {
  workingMessage?: FacebookFeedType | ConversationTwitterStatus;
  recipients?: string[];
};

type Action =
  | {
      type: 'SET_FACEBOOK_FEED_WORKING_MESSAGE';
      payload: { workingMessage: FacebookFeedType };
    }
  | { type: 'CLEAR_FACEBOOK_FEED_WORKING_MESSAGE' }
  | {
      type: 'SET_TWITTER_STATUS_WORKING_MESSAGE';
      payload: {
        workingMessage: ConversationTwitterStatus;
        recipients: string[];
      };
    }
  | {
      type: 'CLEAR_TWITTER_STATUS_WORKING_MESSAGE';
      payload: { recipients?: string[] };
    }
  | {
      type: 'UPDATE_TWITTER_STATUS_RECIPIENTS';
      payload: { recipients: string[] };
    };

const workingMessageReducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'SET_FACEBOOK_FEED_WORKING_MESSAGE':
      return { workingMessage: action.payload.workingMessage };
    case 'CLEAR_FACEBOOK_FEED_WORKING_MESSAGE':
      return {};
    case 'SET_TWITTER_STATUS_WORKING_MESSAGE':
      return {
        workingMessage: action.payload.workingMessage,
        recipients: action.payload.recipients,
      };
    case 'CLEAR_TWITTER_STATUS_WORKING_MESSAGE':
      return { recipients: action.payload.recipients };
    case 'UPDATE_TWITTER_STATUS_RECIPIENTS':
      if (!isEqual(action.payload.recipients, state.recipients)) {
        return { recipients: action.payload.recipients };
      }
      return state;
    default:
      return state;
  }
};

const MessagesWrapper = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

const PreviewBackground = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: ${ZIndexes.previewBackground};
`;

const ChatSocialConnectable: React.FC<Props> = ({
  agent,
  createFacebookFeedRequest,
  createTwitterDirectMessageEvent,
  createTwitterStatus,
  customerTwitterUser,
  deleteFacebookFeedRequest,
  deleteTwitterDirectMessageEventRequest,
  editFacebookFeedRequest,
  facebookFeedLikeRequest,
  facebookFeedUnlikeRequest,
  facebookFeeds,
  facebookMessages,
  fetchConversationRequest,
  fetchFacebookFeedsRequest,
  fetchFacebookMessagesRequest,
  fetchTwitterDirectMessages,
  fetchTwitterStatuses,
  fetchInstagramCommentsRequest,
  createInstagramCommentRequest,
  deleteInstagramCommentRequest,
  fetchWhatsAppMessagesRequest,
  createWhatsAppMessageRequest,
  isFetchingConversation,
  isFetchingMessages,
  markAsReadRequest,
  project,
  sendFacebookMessageRequest,
  showDialogsRequest,
  ticket,
  twitterDirectMessages,
  twitterStatuses,
  instagramComments,
  updateConversationTicketAssignmentRequest,
  initialOrNextFetchedTimestamp,
  whatsAppMessages,
}) => {
  const intl = useIntl();
  const messagesWrapperRef = useRef<HTMLDivElement>(null);
  const messagesComponent = useRef<SocialMessagesRef | null>(null);

  const [{ workingMessage, recipients }, dispatch] = useReducer(workingMessageReducer, {});
  const { id: ticketId, channelType: ticketChannelType } = ticket;

  const { conversationTickets: conversationTicketsContext } = useContext(ConversationContext);
  const { updateTickets, updateTicketsAssignment } = conversationTicketsContext;

  const messages = (() => {
    switch (ticketChannelType) {
      case 'FACEBOOK_CONVERSATION':
        return facebookMessages;
      case 'FACEBOOK_FEED':
        return facebookFeeds;
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
        return twitterDirectMessages;
      case 'TWITTER_STATUS':
        return twitterStatuses;
      case 'INSTAGRAM_COMMENT':
        return instagramComments;
      case 'WHATSAPP_MESSAGE':
        return whatsAppMessages;
      default:
        return [];
    }
  })();

  const setFirstMessageNode = useScrollPositionRestoration({
    messageCount: messages.length,
    scrollTo: useCallback((y) => {
      if (messagesComponent.current) {
        messagesComponent.current.scrollTo(y);
      }
    }, []),
  });

  const markAsReadAfterSend = () => {
    if (ticket && project.markAsReadType === 'AFTER_SEND_MESSAGE') {
      markAsReadRequest({ ticketId, onSuccess: updateTickets });
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  const reloadMessages = useCallback(() => {
    switch (ticketChannelType) {
      case 'FACEBOOK_CONVERSATION':
        fetchFacebookMessagesRequest({
          types: 'initial',
          ticketId,
          prevLimit: 50,
          ts: Date.now(),
          initial: true,
        });
        break;

      case 'FACEBOOK_FEED':
        fetchFacebookFeedsRequest({
          types: 'initial',
          ticketId,
          prevLimit: 50,
          ts: Date.now(),
          initial: true,
        });
        break;

      case 'TWITTER_DIRECT_MESSAGE_EVENT':
        fetchTwitterDirectMessages({
          types: 'initial',
          ticketId,
          prevLimit: 50,
          ts: Date.now(),
          initial: true,
        });
        break;

      case 'TWITTER_STATUS':
        fetchTwitterStatuses({
          types: 'initial',
          ticketId,
          prevLimit: 50,
          ts: Date.now(),
          initial: true,
        });
        break;

      case 'INSTAGRAM_COMMENT':
        fetchInstagramCommentsRequest({
          types: 'initial',
          ticketId,
          prevLimit: 50,
          ts: Date.now(),
          initial: true,
        });
        break;

      case 'WHATSAPP_MESSAGE':
        fetchWhatsAppMessagesRequest({
          types: 'initial',
          ticketId,
          prevLimit: 50,
          ts: Date.now(),
        });
        break;

      // no default
    }

    if (project.markAsReadType === 'AFTER_READ_MESSAGE') {
      markAsReadRequest({ ticketId, onSuccess: updateTickets });
    }
  }, [
    ticketChannelType,
    project.markAsReadType,
    fetchFacebookMessagesRequest,
    ticketId,
    fetchFacebookFeedsRequest,
    fetchTwitterDirectMessages,
    fetchTwitterStatuses,
    markAsReadRequest,
    // updateTickets, // FIXME
  ]);

  const clearWorkingMessage = useCallback(() => {
    if (twitterStatuses && ticketChannelType === 'TWITTER_STATUS') {
      const lastTwitterStatus =
        twitterStatuses.length > 0
          ? findLast<ConversationTwitterStatus>(twitterStatuses, (message) => message.messageType === 'social')
          : undefined;

      const recipients = lastTwitterStatus && lastTwitterStatus.defaultRecipients;

      dispatch({
        type: 'CLEAR_TWITTER_STATUS_WORKING_MESSAGE',
        payload: { recipients },
      });
      return;
    }

    dispatch({ type: 'CLEAR_FACEBOOK_FEED_WORKING_MESSAGE' });
  }, [ticketChannelType, twitterStatuses]);

  useEffect(() => {
    reloadMessages();
  }, [ticketId, reloadMessages]);

  const lastTwitterStatus = twitterStatuses[twitterStatuses.length - 1];

  useEffect(() => {
    if (!workingMessage) {
      // update recipients
      clearWorkingMessage();
    }
  }, [lastTwitterStatus, workingMessage, clearWorkingMessage]);

  const latestMessages = useRef({
    isFetching: isFetchingConversation || isFetchingMessages,
    facebookMessages,
    facebookFeeds,
    twitterDirectMessages,
    twitterStatuses,
    instagramComments,
    whatsAppMessages,
  });

  useEffect(() => {
    latestMessages.current = {
      isFetching: isFetchingConversation || isFetchingMessages,
      facebookMessages,
      facebookFeeds,
      twitterDirectMessages,
      twitterStatuses,
      instagramComments,
      whatsAppMessages,
    };
  }, [
    facebookFeeds,
    facebookMessages,
    isFetchingConversation,
    isFetchingMessages,
    twitterDirectMessages,
    twitterStatuses,
    instagramComments,
    whatsAppMessages,
  ]);

  const fetchPreviousMessages = () => {
    /**
     * This function will be called by scroll event, and directly accessing to the props in this function will get
     * stale values that was captured when this function was defined. That's why we use `latestMessages.current` to
     * get the latest prop values at the moment of this function gets called.
     */
    const {
      isFetching,
      facebookMessages: latestFacebookMessages,
      facebookFeeds: latestFacebookFeeds,
      twitterDirectMessages: latestTwitterDirectMessages,
      twitterStatuses: latestTwitterStatuses,
      instagramComments: latestInstagramComments,
      whatsAppMessages: latestWhatsAppMessages,
    } = latestMessages.current;

    if (!isFetching) {
      // Save the first message node now to restore the scroll position after the messages are added.
      setFirstMessageNode(messagesComponent.current && messagesComponent.current.findFirstMessageNode());
      switch (ticketChannelType) {
        case 'FACEBOOK_CONVERSATION':
          fetchFacebookMessagesRequest({
            types: 'prev',
            ticketId,
            prevLimit: 50,
            nextLimit: 0,
            ts: latestFacebookMessages.length > 0 ? latestFacebookMessages[0].timestamp : 0,
          });
          break;

        case 'FACEBOOK_FEED':
          fetchFacebookFeedsRequest({
            types: 'prev',
            ticketId,
            ts: latestFacebookFeeds.length > 0 ? latestFacebookFeeds[0].timestamp : 0,
            prevLimit: 50,
            nextLimit: 0,
          });
          break;

        case 'TWITTER_DIRECT_MESSAGE_EVENT':
          fetchTwitterDirectMessages({
            types: 'prev',
            ticketId,
            ts: latestTwitterDirectMessages.length > 0 ? latestTwitterDirectMessages[0].timestamp : 0,
            prevLimit: 50,
            nextLimit: 0,
          });
          break;

        case 'TWITTER_STATUS':
          fetchTwitterStatuses({
            types: 'prev',
            ticketId,
            ts: latestTwitterStatuses.length > 0 ? latestTwitterStatuses[0].timestamp : 0,
            prevLimit: 50,
            nextLimit: 0,
          });
          break;

        case 'INSTAGRAM_COMMENT':
          fetchInstagramCommentsRequest({
            types: 'prev',
            ticketId,
            ts: latestInstagramComments.length > 0 ? latestInstagramComments[0].instagramComment.timestamp : 0,
            prevLimit: 50,
            nextLimit: 0,
          });
          break;

        case 'WHATSAPP_MESSAGE':
          fetchWhatsAppMessagesRequest({
            types: 'prev',
            ticketId,
            ts: latestWhatsAppMessages.length > 0 ? latestWhatsAppMessages[0].timestamp : 0,
            prevLimit: 50,
            nextLimit: 0,
          });
          break;

        default:
          break;
      }
    }
  };

  const handleSocialInputSubmit = (originalMessageText: string, filesOrMediaIds: (File | string)[]) => {
    const recipientId = ticket.customer.sendbirdId.split('//')[1];
    const messageText = originalMessageText.trim();

    if (!messageText && filesOrMediaIds.length === 0) {
      return;
    }

    switch (ticketChannelType) {
      case 'FACEBOOK_CONVERSATION':
        sendFacebookMessageRequest({
          ticketId,
          recipientId,
          messageText,
          filedata: filesOrMediaIds.length > 0 ? filesOrMediaIds[0] : undefined,
          facebookPageId: (ticket as FacebookTicket<'FACEBOOK_CONVERSATION'>).facebookPage.pageId,
        });
        break;

      case 'FACEBOOK_FEED': {
        let data: any;
        try {
          data = JSON.parse(ticket.data);
        } catch (e) {
          logException({ error: e, context: { data: ticket.data } });
        }

        const fromId = (ticket as FacebookTicket<'FACEBOOK_FEED'>).facebookPage.pageId.toString();
        const getParentFeedId = () => {
          if (workingMessage) {
            return (workingMessage as FacebookFeedType).feedId;
          }

          const customerFeeds = facebookFeeds.filter((message) => message.fromId === recipientId);
          if (customerFeeds.length > 0) {
            const latestFeed = customerFeeds[customerFeeds.length - 1];
            if (latestFeed.parentId !== data.social.postId) {
              // latestFeed is a reply from a comment.
              return latestFeed.parentId;
            }
            return latestFeed.feedId;
          }
          return data.social.postId;
        };
        // previous logic
        // isEmpty(workingMessage) ? data.social.postId : workingMessage.feedId
        // -> create feed to original post if reply target is not defined

        // new logic
        // reply to the latest customer's feed by default
        createFacebookFeedRequest({
          ticketId,
          fromId,
          payload: {
            parentFeedId: getParentFeedId(),
            messageText,
            filedata: filesOrMediaIds.length > 0 ? filesOrMediaIds[0] : undefined,
          },
        });
        clearWorkingMessage();
        break;
      }
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
        createTwitterDirectMessageEvent({
          ticket,
          recipientId,
          messageText,
          mediaId: filesOrMediaIds.length > 0 ? (filesOrMediaIds[0] as string) : undefined,
        });
        break;

      case 'TWITTER_STATUS': {
        let inReplyToMessage: ConversationTwitterStatus | undefined = workingMessage as ConversationTwitterStatus;
        if (!inReplyToMessage) {
          // If inReplyToMessage is not specified, pick the last social message as inReplyToMessage.
          inReplyToMessage = findLast<ConversationTwitterStatus>(
            twitterStatuses,
            (message) => message.messageType === 'social',
          );
        }
        createTwitterStatus({
          ticket,
          recipientId,
          messageText: [...(recipients || []), messageText.trim()].join(' '),
          inReplyToStatusId: inReplyToMessage ? inReplyToMessage.statusId : undefined,
          mediaIds: filesOrMediaIds.length > 0 ? (filesOrMediaIds as string[]) : undefined,
        });
        clearWorkingMessage();
        break;
      }

      case 'INSTAGRAM_COMMENT':
        createInstagramCommentRequest({
          ticket,
          igMediaId: (JSON.parse(ticket.data) as InstagramTicketData).social.source.ig_media_id,
          text: messageText,
          instagramUsername: (ticket as InstagramTicket).instagramUser.username,
        });
        break;

      case 'WHATSAPP_MESSAGE':
        createWhatsAppMessageRequest({
          ticketId: ticket.id,
          toNumber: ticket.customer.displayName.substring(1),
          messageText,
          filedata: filesOrMediaIds[0],
        });
        break;

      // no default
    }

    if (ticket.recentAssignment?.status === 'NOT_RESPONSED' || ticket.recentAssignment?.status === 'IDLE') {
      updateConversationTicketAssignmentRequest({
        assignmentId: ticket.recentAssignment.id,
        payload: { status: 'RESPONSED' },
        onSuccess: (assignment: Assignment) => {
          fetchConversationRequest({ ticketId });
          updateTicketsAssignment({ assignment });
        },
      });
    }

    markAsReadAfterSend();
  };

  const handleFeedAction = ({
    message,
    action,
  }: {
    message:
      | FacebookFeedType
      | AttachmentParsedTwitterDirectMessageEvent
      | ConversationTwitterStatus
      | InstagramCommentTicket;
    action: 'LIKE' | 'REPLY' | 'UNLIKE' | 'HIDE' | 'UNHIDE' | 'REMOVE' | 'DELETE';
  }) => {
    const { facebookPage, twitterUser, instagramUser, channelType } = ticket;

    if (facebookPage) {
      const feed = message as FacebookFeedType;
      const { feedId } = feed;

      switch (action) {
        case 'REPLY':
          dispatch({
            type: 'SET_FACEBOOK_FEED_WORKING_MESSAGE',
            payload: { workingMessage: feed },
          });
          break;

        case 'LIKE':
          facebookFeedLikeRequest({ ticketId, feed });
          break;

        case 'UNLIKE':
          facebookFeedUnlikeRequest({ ticketId, feed });
          break;

        case 'HIDE':
          editFacebookFeedRequest({ ticketId, feedId, isHidden: true });
          break;

        case 'UNHIDE':
          editFacebookFeedRequest({ ticketId, feedId, isHidden: false });
          break;

        case 'REMOVE':
          showDialogsRequest({
            dialogTypes: DialogType.Delete,
            dialogProps: {
              title: intl.formatMessage({ id: 'desk.conversation.facebook.dialog.delete.title' }),
              description: intl.formatMessage({ id: 'desk.conversation.facebook.dialog.delete.desc' }),
              confirmText: intl.formatMessage({ id: 'desk.conversation.facebook.dialog.delete.confirm' }),
              cancelText: intl.formatMessage({ id: 'desk.conversation.facebook.dialog.delete.cancel' }),
              onDelete: () => {
                deleteFacebookFeedRequest({ ticketId, feed });
              },
            },
          });
          break;

        default:
          return;
      }
      return;
    }

    if (twitterUser && channelType === 'TWITTER_DIRECT_MESSAGE_EVENT') {
      switch (action) {
        case 'DELETE':
          showDialogsRequest({
            dialogTypes: DialogType.Delete,
            dialogProps: {
              // FIXME: needs to be changed with key
              title: 'Delete Twitter message',
              description: 'Are you sure you want to delete this message?',
              confirmText: 'Delete',
              onDelete: () => {
                deleteTwitterDirectMessageEventRequest({ id: message.id });
              },
            },
          });
          break;

        default:
          return;
      }
    }

    if (twitterUser && channelType === 'TWITTER_STATUS') {
      const twitterStatus = message as ConversationTwitterStatus;

      switch (action) {
        case 'REPLY': {
          dispatch({
            type: 'SET_TWITTER_STATUS_WORKING_MESSAGE',
            payload: {
              workingMessage: twitterStatus,
              recipients: twitterStatus.defaultRecipients,
            },
          });
          break;
        }
        default:
          return;
      }
    }

    if (instagramUser && channelType === 'INSTAGRAM_COMMENT') {
      switch (action) {
        case 'DELETE': {
          const instagramCommentTicket = message as InstagramCommentTicket;
          showDialogsRequest({
            dialogTypes: DialogType.Delete,
            dialogProps: {
              // FIXME: needs to be changed with key
              title: 'Delete Instagram comment',
              description: 'Are you sure you want to delete this comment?',
              confirmText: 'Delete',
              onDelete: () => {
                deleteInstagramCommentRequest({
                  ticketId,
                  instagramCommentId: instagramCommentTicket.instagramComment.id,
                });
              },
            },
          });

          break;
        }

        default:
          return;
      }
    }
  };

  const handlePreviewClear = () => {
    clearWorkingMessage();
  };

  const onEditRecipientsButtonClick = () => {
    if (!ticket.twitterUser || !customerTwitterUser) {
      return;
    }

    // To show selectable recipient list, workingMessage or the last message of the ticket must exist.
    const workingMessageOrLastMessage =
      workingMessage ||
      (twitterStatuses.length > 0
        ? findLast<ConversationTwitterStatus>(twitterStatuses, (message) => message.messageType === 'social')
        : undefined);

    if (!workingMessageOrLastMessage) {
      return;
    }

    const twitterStatus = workingMessageOrLastMessage as ConversationTwitterStatus;

    const customerScreenName = `@${customerTwitterUser.screen_name}`;

    /**
     * Exclude `customerScreenName` from `selectableRecipients`. `customerScreenName` is always selected and an agent
     * cannot deselect it.
     */
    const selectableRecipents = twitterStatus.defaultRecipients.filter(
      (recipient) => !isEqualIgnoreCase(recipient, customerScreenName),
    );

    showDialogsRequest({
      dialogTypes: DialogType.SelectTwitterStatusRecipients,
      dialogProps: {
        customerName: customerScreenName,
        selectableRecipents,
        currentRecipients: recipients || [],
        onSubmit: (recipients) =>
          dispatch({
            type: 'UPDATE_TWITTER_STATUS_RECIPIENTS',
            payload: { recipients },
          }),
      },
    });
  };

  return (
    <ChatBubbleMenuPopperBoundariesElementContext.Provider value={messagesWrapperRef.current || undefined}>
      {!isEmpty(workingMessage) && <PreviewBackground onClick={handlePreviewClear} />}
      {isFetchingMessages ? <SpinnerFull transparent={true} /> : ''}
      <MessagesWrapper ref={messagesWrapperRef}>
        <SocialMessages
          /**
           * FIXME: Remove any
           * React-redux connect() has an issue in typing ref prop.
           * https://github.com/DefinitelyTyped/DefinitelyTyped/issues/35661
           */
          ref={messagesComponent as any}
          ticket={ticket}
          messages={messages}
          initialOrNextFetchedTimestamp={initialOrNextFetchedTimestamp}
          fetchMessagesPrev={fetchPreviousMessages}
          handleFeedAction={handleFeedAction}
        />
      </MessagesWrapper>
      {(ticket.status2 === TicketStatus.ACTIVE || ticket.status2 === TicketStatus.IDLE) &&
      ticket.recentAssignment &&
      ticket.recentAssignment &&
      ticket.recentAssignment.agent.id === agent.id ? (
        <SocialInput
          ticket={ticket}
          maxHeight={300}
          workingMessage={workingMessage}
          clearWorkingMessage={handlePreviewClear}
          recipients={recipients}
          allowedFileExtensions={ticket.channelType === 'WHATSAPP_MESSAGE' ? '' : 'image/*,video/*'}
          onSubmit={handleSocialInputSubmit}
          onEditRecipientsButtonClick={onEditRecipientsButtonClick}
        />
      ) : (
        ''
      )}
    </ChatBubbleMenuPopperBoundariesElementContext.Provider>
  );
};

export const ChatSocial = connect(mapStateToProps, mapDispatchToProps)(ChatSocialConnectable);

ChatSocial.displayName = 'ChatSocial';
