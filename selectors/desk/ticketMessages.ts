import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import { createSelector } from 'reselect';

import { TicketStatus } from '@constants';
import { isEqualIgnoreCase } from '@utils';

export const isTicketMustBeFetchedUsingPlatformAPI = (ticket: Ticket, currentDeskAgentId: number) =>
  ticket.status2 === TicketStatus.WIP ||
  ticket.status2 === TicketStatus.PENDING ||
  ticket.status2 === TicketStatus.CLOSED ||
  ticket.recentAssignment?.agent.id !== currentDeskAgentId;

export const getConversationPlatformAPIMessages = createSelector(
  (state: RootState) => state.conversation,
  (state: RootState) => state.desk.agent.id,
  (conversation, currentDeskAgentId) => {
    const { ticket } = conversation;
    if (
      !ticket ||
      !(
        ticket.channelType === 'SENDBIRD' ||
        ticket.channelType === 'SENDBIRD_JAVASCRIPT' ||
        ticket.channelType === 'SENDBIRD_IOS' ||
        ticket.channelType === 'SENDBIRD_ANDROID'
      )
    ) {
      return [];
    }

    if (isTicketMustBeFetchedUsingPlatformAPI(ticket, currentDeskAgentId)) {
      return conversation.messages as SendBirdAPIMessage[];
    }
    return [];
  },
);

export const sortedFacebookMessages = createSelector(
  (state: ConversationState) => state.facebookMessages,
  (messages) => {
    return orderBy(messages, ['timestamp'], ['asc']);
  },
);

export const sortedFacebookFeeds = createSelector(
  (state: ConversationState) => state.facebookFeeds,
  (messages) => {
    return orderBy(messages, ['timestamp'], ['asc']);
  },
);

export const sortedInstagramComments = createSelector(
  (state: ConversationState) => state.instagramComments,
  (messages) => {
    return sortBy(messages, (message) => message.instagramComment.timestamp, ['asc']);
  },
);

export const sortedTwitterDirectMessages = createSelector(
  (state: ConversationState) => state.twitterDirectMessages,
  (messages) => orderBy(messages, ['timestamp'], ['asc']),
);

const getTwitterStatusReplyDefaultMentionList = (parameters: {
  customerScreenName?: string;
  replySenderScreenName?: string;
  replyingToMessageSenderScreenName?: string;
  replyingToMessageText: string;
}) => {
  const {
    customerScreenName = '',
    replySenderScreenName = '',
    replyingToMessageText,
    replyingToMessageSenderScreenName = '',
  } = parameters;
  const mentionsInLastMessage = (replyingToMessageText.match(/@[\w-_]+/g) || []).map((token) =>
    token.replace(/^@/, ''),
  );

  /**
   * Include the customer, the sender of and the mentions in the last message in the mention list. If it is the customer
   * who sent the last message, exclude the agent's twitter account from the mention list. (because the agent is
   * replying to the customer)
   */
  return [replyingToMessageSenderScreenName, ...mentionsInLastMessage]
    .reduce<string[]>((acc, cur) => {
      // removes duplicated screen names by comparing items ignoring case.
      if (acc.findIndex((item) => isEqualIgnoreCase(item, cur)) > -1) {
        return acc;
      }
      acc.push(cur);
      return acc;
    }, [])
    .filter(
      (screenName) =>
        // Customer must always be one of the recipients(=mentions).
        isEqualIgnoreCase(screenName, customerScreenName) ||
        // Never include the agent's screen name in the recipients.
        !isEqualIgnoreCase(screenName, replySenderScreenName),
    )
    .map((screenName) => `@${screenName}`);
};

const addDefaultRecipients = (twitterUser: TwitterUser | null, customerScreenName?: string) => (
  twitterStatus: MergedTwitterStatus,
): ConversationTwitterStatus => {
  if (!twitterUser) {
    return {
      ...twitterStatus,
      defaultRecipients: getTwitterStatusReplyDefaultMentionList({
        customerScreenName,
        replyingToMessageText: twitterStatus.text,
      }),
    };
  }
  return {
    ...twitterStatus,
    defaultRecipients: getTwitterStatusReplyDefaultMentionList({
      customerScreenName,
      replySenderScreenName: twitterUser.screenName,
      replyingToMessageSenderScreenName:
        twitterStatus.senderId === twitterUser.userId ? twitterUser.screenName : customerScreenName,
      replyingToMessageText: twitterStatus.text,
    }),
  };
};

export const sortedTwitterStatuses = createSelector(
  (state: RootState) => state.conversation.twitterStatuses,
  (state: RootState) => state.twitter.twitterUser,
  (state: RootState) => state.conversation.ticket,
  (mergedTwitterStatuses, customerTwitterUser, ticket) => {
    const { twitterUser = null } = ticket || {};
    const { screen_name: customerScreenName = undefined } = customerTwitterUser || {};

    return orderBy(mergedTwitterStatuses, (item) => item.timestamp, ['asc']).map(
      addDefaultRecipients(twitterUser, customerScreenName),
    );
  },
);

export const sortedTicketDetailMessages = createSelector(
  (state: RootState) => state.ticketDetail.ticket?.channelType,
  (state: RootState) => state.ticketDetail.messages,
  (channelType, messages) => {
    switch (channelType) {
      case 'SENDBIRD_JAVASCRIPT':
      case 'SENDBIRD_IOS':
      case 'SENDBIRD_ANDROID':
      case 'SENDBIRD':
        return messages;
      case 'FACEBOOK_CONVERSATION':
      case 'FACEBOOK_FEED':
        return orderBy(messages, ['timestamp', 'asc']);
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
        return orderBy(messages, ['timestamp'], ['asc']);
      case 'TWITTER_STATUS':
        return orderBy(messages, ['timestamp'], ['asc']);
      case 'INSTAGRAM_COMMENT':
        return sortBy(messages, (message) => (message as InstagramCommentTicket).instagramComment.timestamp, ['asc']);
      case 'WHATSAPP_MESSAGE':
        return orderBy(messages, ['timestamp'], ['asc']);
      default:
        return [];
    }
  },
);

export const sortedTicketHistoryMessages = createSelector(
  (state: RootState) => state.ticketHistory,
  (ticketHistory: TicketHistoryState) => {
    const { current: currentTicket, messages } = ticketHistory as TicketHistoryState;

    if (!currentTicket) {
      return [];
    }

    switch (currentTicket.channelType) {
      case 'SENDBIRD_JAVASCRIPT':
      case 'SENDBIRD_IOS':
      case 'SENDBIRD_ANDROID':
      case 'SENDBIRD':
        return messages;
      case 'FACEBOOK_CONVERSATION':
      case 'FACEBOOK_FEED':
        return orderBy(messages, ['timestamp', 'asc']);
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
        return orderBy(messages, ['timestamp', 'asc']);
      case 'TWITTER_STATUS':
        return orderBy(messages, ['timestamp', 'asc']);
      case 'INSTAGRAM_COMMENT':
        return sortBy(messages, (message) => (message as InstagramCommentTicket).instagramComment.timestamp, ['asc']);
      case 'WHATSAPP_MESSAGE':
        return orderBy(messages, ['timestamp'], ['asc']);

      default:
        throw new Error(`Undefined TicketChannelType: ${currentTicket.channelType}`);
    }
  },
);
