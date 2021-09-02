import { createContext } from 'react';

import {
  ConversationTicketsContext,
  initialState as conversationTicketsInitialState,
} from './conversationTicketsContext';

export type ConversationContext = {
  conversationTickets: ConversationTicketsContext;
};

export const ConversationContext = createContext<ConversationContext>({
  conversationTickets: {
    state: conversationTicketsInitialState,
    setState: () => {},
    toggleIsSearchMode: () => {},
    updateIsSearchMode: () => {},
    updateIsSearched: () => {},
    updateFilter: () => {},
    updateSortType: () => {},
    updateCounts: () => {},
    updateCurrentPagination: () => {},
    initCurrentChannels: () => {},
    addTickets: () => {},
    updateTickets: () => {},
    updateTicketsAssignment: () => {},
    removeFromCurrentTickets: () => {},
    resetCurrentTickets: () => {},
    fetchCurrentTickets: () => {},
    resetSearch: () => {},
    fetchSearchTickets: () => {},
    fetchAssignedTickets: () => {},
    fetchAssignedTicketsCounts: () => {},
    updateSearchQuery: () => {},
  },
});
