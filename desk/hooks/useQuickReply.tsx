import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { toast, cssVariables, ScrollBarRef } from 'feather';
import debounce from 'lodash/debounce';

import { deskApi } from '@api';
import { useDeskAuth } from '@authorization/useDeskAuth';
import { QuickRepliesAvailableType } from '@constants';
import { replacePropertiesToTicketValue } from '@desk/containers/conversation/input/constants';
import { pasteHtmlAtCaret, replaceWordNearCaret } from '@desk/containers/settings/quickReplies/caretUtils';
import { getErrorMessage } from '@epics';
import { ContentEditableRef } from '@ui/components';

export interface QuickReplyTemplate {
  message: QuickReply['message'];
  name: QuickReply['name'];
  value: QuickReply['id'];
}

export type QuickRepliesSearchCounts = {
  [key: string]: number;
};

export const NoResult = styled.div`
  padding: 40px 16px;
  width: 276px;
  text-align: center;
`;

export const NoResultTitle = styled.span`
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-5')};
`;

const useQuickReply = (caretPrefix: string) => {
  useDeskAuth();

  const pid = useSelector<RootState, Project['pid']>((state) => state.desk.project.pid);
  const region = useSelector<RootState, Application['app_id']>((state) => state.applicationState.data?.region ?? '');

  const rangeRef = useRef<Range | null>(null);
  const contentEditableRef = useRef<ContentEditableRef>(null);
  const popperContentRef = useRef<HTMLDivElement>(null);
  const itemContainerRef = useRef<HTMLUListElement>(null);
  const itemScrollRef = useRef<ScrollBarRef>(null);

  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isFetchingQuickReplies, setIsFetchingQuickReplies] = useState(false);

  const [activeQuickReplyTypeId, setActiveQuickReplyTypeId] = useState(0);

  const [searchCounts, setSearchCounts] = useState<QuickRepliesSearchCounts>({ all: 0, agent: 0 });
  const [isSearched, setIsSearched] = useState(false);

  const [caretQuickReplyQuery, setCaretQuickReplyQuery] = useState('');
  const [dropdownQuickReplyQuery, setDropdownQuickReplyQuery] = useState('');

  const [isOpenCaretPopper, setIsOpenCaretPopper] = useState(false);
  const [isOpenDropdownPopper, setIsOpenDropdownPopper] = useState(false);

  const [total, setTotal] = useState(-1);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const pageSize = 10;
  const hasMore = total > quickReplies.length;
  const availableType = useMemo(() => {
    if (activeQuickReplyTypeId === 0) {
      return [QuickRepliesAvailableType.ALL];
    }

    if (activeQuickReplyTypeId > 0) {
      return [QuickRepliesAvailableType.GROUP];
    }

    return [QuickRepliesAvailableType.AGENT];
  }, [activeQuickReplyTypeId]);

  const saveSelectionRange = useCallback((element: HTMLElement) => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.getRangeAt && selection.rangeCount && element) {
        if (selection.containsNode(element, true)) {
          rangeRef.current = selection.getRangeAt(0).cloneRange();
        } else {
          const range = document.createRange();
          range.setStart(element, 0);
          range.setEnd(element, 0);
          rangeRef.current = range;
        }
      }
    }
  }, []);

  const restoreSelectionRange = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        rangeRef.current && selection.addRange(rangeRef.current);
      }
    }
  };

  const saveSelectionOnContentEditable = useCallback(() => {
    const element = contentEditableRef.current?.getCurrent();
    if (element) {
      saveSelectionRange(element);
    }
  }, [saveSelectionRange]);

  const searchQuickRepliesRequest = useCallback(
    async ({
      offset,
      limit,
      name,
      isNext = false,
    }: Omit<SearchQuickRepliesRequestPayload, 'availableType' | 'group'> & { isNext?: boolean }) => {
      setIsFetchingQuickReplies(true);
      try {
        const { data } = await deskApi.searchQuickReply(pid, region, {
          offset,
          limit,
          name,
          availableType,
          group: availableType.includes(QuickRepliesAvailableType.GROUP) ? activeQuickReplyTypeId : undefined,
        });

        if (isNext) {
          setQuickReplies(quickReplies.concat(data.results));
        } else {
          setQuickReplies(data.results);
        }
        setTotal(data.count);
      } catch (e) {
        toast.error({ message: getErrorMessage(e) });
      } finally {
        setIsFetchingQuickReplies(false);
      }
    },
    [activeQuickReplyTypeId, availableType, pid, quickReplies, region],
  );

  const fetchSearchCountsRequest = useCallback(
    async ({ name }) => {
      try {
        const { data: counts } = await deskApi.fetchQuickReplySearchCounts(pid, region, { offset: 0, limit: 0, name });
        setSearchCounts(counts);
        if (name.trim().length > 0 && !isSearched) {
          setIsSearched(true);
          return;
        }

        if (name.trim().length === 0 && isSearched) {
          setIsSearched(false);
        }
      } catch (e) {
        toast.error({ message: getErrorMessage(e) });
      }
    },
    [isSearched, pid, region],
  );

  const reset = useCallback(() => {
    setIsOpenCaretPopper(false);
    setIsOpenDropdownPopper(false);
    setDropdownQuickReplyQuery('');
    setCaretQuickReplyQuery('');
    setHighlightedIndex(-1);
    setActiveQuickReplyTypeId(0);
    fetchSearchCountsRequest({ name: '' });
  }, [fetchSearchCountsRequest]);

  useEffect(() => {
    fetchSearchCountsRequest({ name: '' });
  }, []);

  useEffect(() => {
    if (!isOpenCaretPopper && caretQuickReplyQuery.indexOf(caretPrefix) === 0) {
      setIsOpenCaretPopper(true);
      setIsOpenDropdownPopper(false);
      return;
    }

    if (caretQuickReplyQuery.indexOf(caretPrefix) !== 0 && isOpenCaretPopper) {
      setIsOpenCaretPopper(false);
    }
  }, [caretPrefix, caretQuickReplyQuery, isOpenCaretPopper, quickReplies]);

  const debouncedUpdateDropdownPropertyQuery = useMemo(
    () =>
      debounce((keyword: string) => {
        setDropdownQuickReplyQuery(keyword);
      }, 400),
    [],
  );

  const handleQuickReplyDropdownSearchChange = useCallback(
    (keyword) => {
      if (dropdownQuickReplyQuery !== keyword) {
        debouncedUpdateDropdownPropertyQuery(keyword);
      }
    },
    [debouncedUpdateDropdownPropertyQuery, dropdownQuickReplyQuery],
  );

  const handleQuickReplyDropdownChange = useCallback(() => {
    caretQuickReplyQuery !== '' && setCaretQuickReplyQuery('');
  }, [caretQuickReplyQuery]);

  const handleAppendQuickReply = useCallback(
    (ticket: Ticket) => (item: QuickReplyTemplate) => {
      restoreSelectionRange();
      if (contentEditableRef.current && rangeRef.current) {
        pasteHtmlAtCaret(rangeRef.current, replacePropertiesToTicketValue(ticket, item.message));
      }
      reset();
    },
    [reset],
  );

  const handleCaretItemClick = useCallback(
    (ticket: Ticket) => (item: QuickReplyTemplate) => (e: React.MouseEvent<HTMLLIElement>) => {
      e?.preventDefault();
      if (contentEditableRef.current && rangeRef.current) {
        replaceWordNearCaret({
          range: rangeRef.current,
          replaceValue: replacePropertiesToTicketValue(ticket, item.message),
          searchQuery: caretQuickReplyQuery,
        });
        reset();
      }
    },
    [caretQuickReplyQuery, reset],
  );

  const handleQuickReplyIconButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e?.preventDefault();
      reset();
      saveSelectionOnContentEditable();
      searchQuickRepliesRequest({
        offset: 0,
        limit: pageSize,
      });
      setIsOpenDropdownPopper(true);
    },
    [reset, saveSelectionOnContentEditable, searchQuickRepliesRequest],
  );

  const handleQuickReplyEditableKeyDown = useCallback(
    (ticket: Ticket, e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isOpenCaretPopper && ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
        e && e.preventDefault();
        e && e.stopPropagation();
        const itemMaxIndex = quickReplies.length - 1;
        const item = quickReplies[highlightedIndex];
        const scrollTop = itemScrollRef.current?.scrollTop || 0;
        const clientHeight = itemScrollRef.current?.clientHeight || 0;

        switch (e.key) {
          case 'ArrowUp':
            if (highlightedIndex - 1 < 0) {
              setHighlightedIndex(itemMaxIndex);
              itemScrollRef.current?.scrollToBottom();
            } else {
              const nextItemNode = itemContainerRef.current?.children[highlightedIndex - 1] as HTMLLIElement;
              const nextItemOffsetTop = nextItemNode ? nextItemNode.offsetTop : 0;
              setHighlightedIndex(highlightedIndex - 1);
              if (scrollTop > nextItemOffsetTop) {
                itemScrollRef.current?.scrollTo({ top: nextItemOffsetTop });
              }
            }
            break;

          case 'ArrowDown':
            if (highlightedIndex + 1 > itemMaxIndex) {
              setHighlightedIndex(0);
              itemScrollRef.current?.scrollToTop();
            } else {
              const nextItemNode = itemContainerRef.current?.children[highlightedIndex + 1] as HTMLLIElement;
              const nextItemNodeHeight = nextItemNode ? nextItemNode.offsetHeight : 0;
              const nextItemOffsetTop = nextItemNode ? nextItemNode.offsetTop : 0;
              setHighlightedIndex(highlightedIndex + 1);
              if (scrollTop + clientHeight - nextItemNodeHeight < nextItemOffsetTop) {
                itemScrollRef.current?.scrollTo({ top: nextItemOffsetTop - clientHeight + nextItemNodeHeight });
              }
            }
            break;

          case 'Enter':
            if (!e.repeat && item && contentEditableRef.current && rangeRef.current) {
              replaceWordNearCaret({
                range: rangeRef.current,
                replaceValue: replacePropertiesToTicketValue(ticket, item.message),
                searchQuery: caretQuickReplyQuery,
              });
              reset();
            }
            break;

          default:
            break;
        }
        return;
      }
    },
    [caretQuickReplyQuery, highlightedIndex, isOpenCaretPopper, quickReplies, reset],
  );

  return {
    quickReplies,
    hasMore,

    highlightedIndex,
    setHighlightedIndex,

    activeQuickReplyTypeId,
    setActiveQuickReplyTypeId,

    isOpenCaretPopper,
    setIsOpenCaretPopper,

    searchCounts,
    isSearched,

    caretQuickReplyQuery,
    setCaretQuickReplyQuery,

    isOpenDropdownPopper,
    setIsOpenDropdownPopper,

    dropdownQuickReplyQuery,
    setDropdownQuickReplyQuery,

    contentEditableRef,
    popperContentRef,
    itemContainerRef,
    itemScrollRef,
    rangeRef,

    saveSelectionRange,
    restoreSelectionRange,
    saveSelectionOnContentEditable,

    handleQuickReplyDropdownSearchChange,
    handleQuickReplyDropdownChange,

    isFetchingQuickReplies,

    searchQuickRepliesRequest,
    fetchSearchCountsRequest,

    handleAppendQuickReply,
    handleQuickReplyIconButtonClick,
    handleCaretItemClick,
    handleQuickReplyEditableKeyDown,

    reset,
  };
};

export default useQuickReply;
