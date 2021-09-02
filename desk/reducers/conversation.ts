import { AuthenticationActionTypes, DeskActionTypes, ConversationActionTypes } from '@actions/types';

const initialState: ConversationState = {
  isFetching: true,
  isFetchingMessages: false,
  messages: [],
  facebookMessages: [],
  facebookFeeds: [],
  twitterDirectMessages: [],
  twitterStatuses: [],
  instagramComments: [],
  whatsAppMessages: [],
  ticket: null,
  typingStatus: {
    typingMembers: [],
    agentTyping: false,
    othersTyping: false,
  },
};

export const conversationReducer: Reducer<ConversationState> = (state = initialState, action) => {
  switch (action.type) {
    case ConversationActionTypes.FETCH_CONVERSATION_MESSAGES_REQUEST:
      return action.payload.types === 'initial'
        ? {
            ...state,
            isFetchingMessages: true,
            messages: [],
          }
        : {
            ...state,
            isFetchingMessages: false,
          };
    case ConversationActionTypes.FETCH_CONVERSATION_MESSAGES_SUCCESS: {
      const { messages, initialOrNextFetchedTimestamp } = action.payload;
      return {
        ...state,
        isFetchingMessages: false,
        messages,
        ...(initialOrNextFetchedTimestamp ? { initialOrNextFetchedTimestamp } : null),
      };
    }

    case ConversationActionTypes.FETCH_FACEBOOK_MESSAGES_REQUEST:
      return action.payload.types === 'initial'
        ? {
            ...state,
            isFetchingMessages: true,
            facebookMessages: [],
          }
        : {
            ...state,
            isFetchingMessages: false,
          };

    case ConversationActionTypes.FETCH_FACEBOOK_MESSAGES_SUCCESS: {
      const { facebookMessages, initialOrNextFetchedTimestamp } = action.payload;
      return {
        ...state,
        isFetchingMessages: false,
        facebookMessages,
        ...(initialOrNextFetchedTimestamp ? { initialOrNextFetchedTimestamp } : null),
      };
    }

    case ConversationActionTypes.UPDATE_FACEBOOK_MESSAGE_REQUEST: {
      const hasTemp = state.facebookMessages.some(
        (facebookMessage) => facebookMessage.mid === action.payload.facebookMessage.mid,
      );
      if (hasTemp) {
        return {
          ...state,
          facebookMessages: state.facebookMessages.map((facebookMessage) => {
            if (facebookMessage.mid === action.payload.facebookMessage.mid) {
              return action.payload.facebookMessage;
            }
            return facebookMessage;
          }),
        };
      }
      return {
        ...state,
        facebookMessages: state.facebookMessages.concat([action.payload.facebookMessage]),
        // When sending a new message, updating initialOrNextFetchedTimestamp state will scroll messages to the bottom.
        initialOrNextFetchedTimestamp: Date.now(),
      };
    }

    case ConversationActionTypes.RESET_CONVERSATION_MESSAGES:
      return {
        ...state,
        messages: [],
        facebookMessages: [],
        facebookFeeds: [],
        twitterDirectMessages: [],
        twitterStatuses: [],
        instagramComments: [],
        whatsAppMessages: [],
      };

    case ConversationActionTypes.FETCH_FACEBOOK_FEEDS_REQUEST:
      return action.payload.types === 'initial'
        ? {
            ...state,
            isFetchingMessages: true,
            facebookFeeds: [],
          }
        : {
            ...state,
            isFetchingMessages: false,
          };
    case ConversationActionTypes.FETCH_FACEBOOK_FEEDS_SUCCESS: {
      const { facebookFeeds, initialOrNextFetchedTimestamp } = action.payload;
      return {
        ...state,
        isFetchingMessages: false,
        facebookFeeds,
        ...(initialOrNextFetchedTimestamp ? { initialOrNextFetchedTimestamp } : null),
      };
    }

    case ConversationActionTypes.UPDATE_FACEBOOK_FEEDS_REQUEST: {
      const hasTemp = state.facebookFeeds.some((item) => item.feedId === action.payload.feedId);
      if (hasTemp) {
        return {
          ...state,
          facebookFeeds: state.facebookFeeds.map((feed) => {
            if (feed.feedId === action.payload.feedId) {
              return action.payload;
            }
            return feed;
          }),
        };
      }
      return {
        ...state,
        facebookFeeds: state.facebookFeeds.concat([action.payload]),
        // When sending a new message, updating initialOrNextFetchedTimestamp state will scroll messages to the bottom.
        initialOrNextFetchedTimestamp: Date.now(),
      };
    }
    case ConversationActionTypes.UPDATE_FACEBOOK_FEED_REQUEST:
      return {
        ...state,
        facebookFeeds: state.facebookFeeds.map((feed) => {
          if (feed.feedId === action.payload.feed.feedId) {
            return action.payload.feed;
          }
          return feed;
        }),
      };
    case ConversationActionTypes.FETCH_TWITTER_DIRECT_MESSAGES_REQUEST:
      return action.payload.types === 'initial'
        ? { ...state, isFetchingMessages: true, twitterDirectMessages: [] }
        : { ...state, isFetchingMessages: false };

    case ConversationActionTypes.FETCH_TWITTER_DIRECT_MESSAGES_SUCCESS: {
      const { messages, initialOrNextFetchedTimestamp } = action.payload;
      return {
        ...state,
        isFetchingMessages: false,
        twitterDirectMessages: messages,
        ...(initialOrNextFetchedTimestamp ? { initialOrNextFetchedTimestamp } : null),
      };
    }

    case ConversationActionTypes.FETCH_TWITTER_DIRECT_MESSAGES_FAIL:
    case ConversationActionTypes.FETCH_TWITTER_STATUSES_FAIL:
      return { ...state, isFetchingMessages: false };

    case ConversationActionTypes.CREATE_TWITTER_DIRECT_MESSAGE_EVENT_SUCCESS:
    case ConversationActionTypes.UPSERT_TWITTER_DIRECT_MESSAGE_EVENT: {
      const duplicatedEventIndex = state.twitterDirectMessages.findIndex(
        (item) => item.eventId === action.payload.eventId,
      );
      if (duplicatedEventIndex > -1) {
        const twitterDirectMessages = [...state.twitterDirectMessages];
        twitterDirectMessages[duplicatedEventIndex] = action.payload;
        return { ...state, twitterDirectMessages };
      }
      return {
        ...state,
        twitterDirectMessages: state.twitterDirectMessages.concat(action.payload),
        // If got a new message, updating initialOrNextFetchedTimestamp state will scroll messages to the bottom.
        initialOrNextFetchedTimestamp: Date.now(),
      };
    }

    case ConversationActionTypes.DELETE_TWITTER_DIRECT_MESSAGE_EVENT_SUCCESS:
      return {
        ...state,
        twitterDirectMessages: state.twitterDirectMessages.map((item) =>
          item.eventId === action.payload.eventId ? { ...item, status: action.payload.status } : item,
        ),
      };

    case ConversationActionTypes.FETCH_TWITTER_STATUSES_REQUEST:
      return action.payload.types === 'initial'
        ? { ...state, isFetchingMessages: true, twitterStatuses: [] }
        : { ...state, isFetchingMessages: false };

    case ConversationActionTypes.FETCH_TWITTER_STATUSES_SUCCESS: {
      const { messages, initialOrNextFetchedTimestamp } = action.payload;
      return {
        ...state,
        isFetchingMessages: false,
        twitterStatuses: messages,
        ...(initialOrNextFetchedTimestamp ? { initialOrNextFetchedTimestamp } : null),
      };
    }

    case ConversationActionTypes.CREATE_TWITTER_STATUS_SUCCESS: {
      const duplicatedStatusIndex = state.twitterStatuses.findIndex(
        (item) => item.statusId === action.payload.statusId,
      );
      if (duplicatedStatusIndex > -1) {
        const twitterStatuses = [...state.twitterStatuses];
        twitterStatuses[duplicatedStatusIndex] = action.payload;
        return { ...state, twitterStatuses };
      }
      return {
        ...state,
        twitterStatuses: state.twitterStatuses.concat(action.payload),
        // If got a new message, updating initialOrNextFetchedTimestamp state will scroll messages to the bottom.
        initialOrNextFetchedTimestamp: Date.now(),
      };
    }

    case ConversationActionTypes.UPDATE_TWITTER_STATUS_FROM_DESK_EVENT: {
      if (state.twitterStatuses.some((item) => item.statusId === action.payload.statusId)) {
        return {
          ...state,
          twitterStatuses: state.twitterStatuses.map((item) =>
            item.statusId === action.payload.statusId ? { ...item, ...action.payload } : item,
          ),
        };
      }
      return {
        ...state,
        twitterStatuses: state.twitterStatuses.concat(action.payload),
        // If got a new message, updating initialOrNextFetchedTimestamp state will scroll messages to the bottom.
        initialOrNextFetchedTimestamp: Date.now(),
      };
    }

    case ConversationActionTypes.PATCH_TWITTER_STATUS_SUCCESS:
      return {
        ...state,
        twitterStatuses: state.twitterStatuses.map((item) =>
          item.id === action.payload.id ? { ...item, status: action.payload.status } : item,
        ),
      };

    case ConversationActionTypes.PATCH_TWITTER_STATUS_TWITTER_USER_SUCCESS: {
      const { twitterStatusId, ...updates } = action.payload;
      return {
        ...state,
        twitterStatuses: state.twitterStatuses.map((item) =>
          item.id === twitterStatusId ? { ...item, ...updates } : item,
        ),
      };
    }

    case ConversationActionTypes.FETCH_INSTAGRAM_COMMENTS_REQUEST:
      return action.payload.types === 'initial'
        ? {
            ...state,
            isFetchingMessages: true,
            instagramComments: [],
          }
        : {
            ...state,
            isFetchingMessages: false,
          };

    case ConversationActionTypes.FETCH_INSTAGRAM_COMMENTS_SUCCESS: {
      const { instagramComments, initialOrNextFetchedTimestamp } = action.payload;
      return {
        ...state,
        isFetchingMessages: false,
        instagramComments,
        ...(initialOrNextFetchedTimestamp ? { initialOrNextFetchedTimestamp } : null),
      };
    }

    case ConversationActionTypes.FETCH_INSTAGRAM_COMMENTS_FAIL:
      return { ...state, isFetchingMessages: false };

    case ConversationActionTypes.UPDATE_INSTAGRAM_COMMENT_SUCCESS: {
      const duplicatedEventIndex = state.instagramComments.findIndex((item) => item.id === action.payload.id);
      const isUpdatable = state.ticket?.id === (action.payload.ticket as Ticket).id;

      if (!isUpdatable) {
        return state;
      }

      if (duplicatedEventIndex > -1) {
        const instagramComments = [...state.instagramComments];
        instagramComments[duplicatedEventIndex] = action.payload;
        return { ...state, instagramComments };
      }
      return {
        ...state,
        instagramComments: state.instagramComments.concat(action.payload),
        // If got a new message, updating initialOrNextFetchedTimestamp state will scroll messages to the bottom.
        initialOrNextFetchedTimestamp: Date.now(),
      };
    }

    case ConversationActionTypes.UPDATE_INSTAGRAM_COMMENT_FROM_DESK_EVENT: {
      if (state.instagramComments.some((item) => item.instagramComment.id === action.payload.instagramComment.id)) {
        return {
          ...state,
          instagramComments: state.instagramComments.map((item) =>
            item.instagramComment.id === action.payload.instagramComment.id ? { ...item, ...action.payload } : item,
          ),
        };
      }
      return {
        ...state,
        instagramComments: state.instagramComments.concat(action.payload),
        // If got a new message, updating initialOrNextFetchedTimestamp state will scroll messages to the bottom.
        initialOrNextFetchedTimestamp: Date.now(),
      };
    }

    case ConversationActionTypes.DELETE_INSTAGRAM_COMMENT_REQUEST: {
      return {
        ...state,
        isFetchingMessages: true,
      };
    }

    case ConversationActionTypes.DELETE_INSTAGRAM_COMMENT_SUCCESS: {
      if (state.instagramComments.some((item) => item.instagramComment.id === action.payload.id)) {
        return {
          ...state,
          instagramComments: state.instagramComments.map((item) =>
            item.instagramComment.id === action.payload.id ? { ...item, instagramComment: action.payload } : item,
          ),
          isFetchingMessages: false,
        };
      }

      return state;
    }

    case ConversationActionTypes.DELETE_INSTAGRAM_COMMENT_FAIL: {
      return {
        ...state,
        isFetchingMessages: false,
      };
    }

    case ConversationActionTypes.FETCH_WHATSAPP_MESSAGES_REQUEST:
      return action.payload.types === 'initial'
        ? {
            ...state,
            isFetchingMessages: true,
            whatsAppMessages: [],
          }
        : {
            ...state,
            isFetchingMessages: false,
          };

    case ConversationActionTypes.FETCH_WHATSAPP_MESSAGES_SUCCESS: {
      const { whatsAppMessages, initialOrNextFetchedTimestamp } = action.payload;
      return {
        ...state,
        isFetchingMessages: false,
        whatsAppMessages,
        ...(initialOrNextFetchedTimestamp ? { initialOrNextFetchedTimestamp } : null),
      };
    }
    case ConversationActionTypes.FETCH_WHATSAPP_MESSAGES_FAIL:
      return {
        ...state,
        isFetchingMessages: false,
      };

    case ConversationActionTypes.CREATE_WHATSAPP_MESSAGE_SUCCESS: {
      const duplicatedMessageIndex = state.whatsAppMessages.findIndex((message) => message.id === action.payload.id);

      if (duplicatedMessageIndex > -1) {
        const whatsAppMessages = [...state.whatsAppMessages];
        whatsAppMessages[duplicatedMessageIndex] = action.payload;
        return { ...state, whatsAppMessages };
      }
      return {
        ...state,
        whatsAppMessages: state.whatsAppMessages.concat(action.payload),
        initialOrNextFetchedTimestamp: Date.now(),
      };
    }

    case ConversationActionTypes.UPDATE_WHATSAPP_MESSAGE_FROM_DESK_EVENT: {
      if (state.whatsAppMessages.some((item) => item.id === action.payload.id)) {
        return {
          ...state,
          whatsAppMessages: state.whatsAppMessages.map((item) =>
            item.id === action.payload.id ? { ...item, ...action.payload } : item,
          ),
        };
      }
      return {
        ...state,
        whatsAppMessages: state.whatsAppMessages.concat(action.payload),
        // If got a new message, updating initialOrNextFetchedTimestamp state will scroll messages to the bottom.
        initialOrNextFetchedTimestamp: Date.now(),
      };
    }

    case ConversationActionTypes.FETCH_CONVERSATION_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    /**
     * Set current viewing active conversation ticket
     */
    case ConversationActionTypes.FETCH_CONVERSATION_SUCCESS:
      return {
        ...state,
        isFetching: false,
        ticket: action.payload,
      };

    case ConversationActionTypes.SET_CONVERSATION_ASSIGNMENT:
      return {
        ...state,
        ticket: state.ticket ? { ...state.ticket, recentAssignment: action.payload } : null,
      };

    case ConversationActionTypes.SET_TYPING_STATUS:
      return {
        ...state,
        typingStatus: action.payload,
      };

    case ConversationActionTypes.SET_AGENT_TYPING_STATUS:
      return {
        ...state,
        typingStatus: { ...state.typingStatus, agentTyping: action.payload },
      };

    case ConversationActionTypes.SET_OTHERS_TYPING_STATUS:
      return {
        ...state,
        typingStatus: { ...state.typingStatus, ...action.payload },
      };

    case ConversationActionTypes.UPDATE_CONVERSATION_TICKET_MESSAGE: {
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.message_id === action.payload.messageId ? { ...message, ...action.payload.updated } : message,
        ),
      };
    }

    case ConversationActionTypes.RESET_CONVERSATION:
    case AuthenticationActionTypes.UNAUTHENTICATED:
    case DeskActionTypes.RESET_DESK:
      return initialState;
    default:
      return state;
  }
};
