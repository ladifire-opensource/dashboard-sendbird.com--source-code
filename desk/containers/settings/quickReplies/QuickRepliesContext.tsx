import React, { createContext } from 'react';

import { ScrollBarRef } from 'feather';

import useQuickReply, { QuickRepliesSearchCounts, QuickReplyTemplate } from '@desk/hooks/useQuickReply';
import { ContentEditableRef } from '@ui/components';

type QuickRepliesContext = {
  quickReplies: QuickReply[];
  hasMore: boolean;

  highlightedIndex: number;
  setHighlightedIndex: (highlightedIndex: number) => void;

  activeQuickReplyTypeId: number;
  setActiveQuickReplyTypeId: (typeId: number) => void;

  isOpenCaretPopper: boolean;
  setIsOpenCaretPopper: (isOpen: boolean) => void;

  searchCounts: QuickRepliesSearchCounts;
  isSearched: boolean;

  caretQuickReplyQuery: string;
  setCaretQuickReplyQuery: (query: string) => void;

  isOpenDropdownPopper: boolean;
  setIsOpenDropdownPopper: (isOpen: boolean) => void;

  dropdownQuickReplyQuery: string;
  setDropdownQuickReplyQuery: (query: string) => void;

  contentEditableRef: React.RefObject<ContentEditableRef>;
  popperContentRef: React.RefObject<HTMLDivElement>;
  itemContainerRef: React.RefObject<HTMLUListElement>;
  itemScrollRef: React.RefObject<ScrollBarRef>;
  rangeRef: React.RefObject<Range | null>;

  saveSelectionRange: (element: HTMLElement) => void;
  restoreSelectionRange: (element?: HTMLElement) => void;
  saveSelectionOnContentEditable: () => void;

  handleQuickReplyDropdownSearchChange: (keyword: string) => void;
  handleQuickReplyDropdownChange: () => void;

  isFetchingQuickReplies: boolean;

  searchQuickRepliesRequest: (
    payload: Omit<SearchQuickRepliesRequestPayload, 'availableType' | 'group'> & { isNext?: boolean },
  ) => void;
  fetchSearchCountsRequest: (payload: { name: string }) => void;

  handleAppendQuickReply: (ticket: Ticket) => (item: QuickReplyTemplate) => void;
  handleQuickReplyIconButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleCaretItemClick: (ticket: Ticket) => (item: QuickReplyTemplate) => (e: React.MouseEvent<HTMLLIElement>) => void;
  handleQuickReplyEditableKeyDown: (ticket: Ticket, e: React.KeyboardEvent<HTMLDivElement>) => void;

  reset: () => void;
};

const quickRepliesContext: QuickRepliesContext = {
  quickReplies: [] as QuickReply[],
  hasMore: false,

  highlightedIndex: 0,
  setHighlightedIndex: () => {},

  activeQuickReplyTypeId: -1,
  setActiveQuickReplyTypeId: () => {},

  isOpenCaretPopper: false,
  setIsOpenCaretPopper: () => {},

  searchCounts: {},
  isSearched: false,

  caretQuickReplyQuery: '',
  setCaretQuickReplyQuery: () => {},

  isOpenDropdownPopper: false,
  setIsOpenDropdownPopper: () => {},

  dropdownQuickReplyQuery: '',
  setDropdownQuickReplyQuery: () => {},

  contentEditableRef: { current: null },
  popperContentRef: { current: null },
  itemContainerRef: { current: null },
  itemScrollRef: { current: null },
  rangeRef: { current: null },

  saveSelectionRange: () => {},
  restoreSelectionRange: () => {},
  saveSelectionOnContentEditable: () => {},

  handleQuickReplyDropdownSearchChange: () => {},
  handleQuickReplyDropdownChange: () => {},

  isFetchingQuickReplies: false,

  searchQuickRepliesRequest: () => {},
  fetchSearchCountsRequest: () => {},

  handleAppendQuickReply: () => () => {},
  handleQuickReplyIconButtonClick: () => () => {},
  handleCaretItemClick: () => () => () => {},
  handleQuickReplyEditableKeyDown: () => {},

  reset: () => {},
};

export const QuickRepliesContext = createContext(quickRepliesContext);

export const QuickRepliesProvider = React.memo(({ children }) => {
  const quickRepliesProps = useQuickReply('#');

  return <QuickRepliesContext.Provider value={quickRepliesProps}>{children}</QuickRepliesContext.Provider>;
});
