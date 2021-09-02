import { useState, useMemo, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { IconName, ScrollBar, EmptyState, EmptyStateSize, InputText } from 'feather';

import * as InfiniteScrollComponents from '@chat/components/InfiniteScrollComponents';
import { useInfiniteScroll } from '@hooks';

import { MTUsers } from '../components';

type Props<T> = {
  type: OpenChannelUserListType;
  hasError: boolean;
  hasNext: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadMoreFailed: boolean;
  handleLoadMore: () => void;
  handleReload: () => void;
  items: T[];
  children: (item: T) => JSX.Element;
  filterItems: (params: { item: T; query: string }) => boolean;
};

const EmptyViewWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 48px;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const SpinnerFull = styled(InfiniteScrollComponents.Spinner)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
`;

const EmptyView = styled(EmptyState).attrs({ size: EmptyStateSize.Small })`
  padding: 32px;
`;

const icons: Record<OpenChannelUserListType, IconName> = { participants: 'user', banned: 'ban', muted: 'mute' };

const emptyViewLabels = {
  participants: {
    body: 'chat.channelDetail.sidebar.openChannels.memberList.participants.empty.body',
    title: 'chat.channelDetail.sidebar.openChannels.memberList.participants.empty.title',
  },
  muted: {
    body: 'chat.channelDetail.sidebar.openChannels.memberList.muted.empty.body',
    title: 'chat.channelDetail.sidebar.openChannels.memberList.muted.empty.title',
  },
  banned: {
    body: 'chat.channelDetail.sidebar.openChannels.memberList.banned.empty.body',
    title: 'chat.channelDetail.sidebar.openChannels.memberList.banned.empty.title',
  },
};

const errorViewTitles = {
  participants: 'chat.channelDetail.sidebar.openChannels.memberList.participants.error.failedToLoad.title',
  banned: 'chat.channelDetail.sidebar.openChannels.memberList.banned.error.failedToLoad.title',
  muted: 'chat.channelDetail.sidebar.openChannels.memberList.muted.error.failedToLoad.title',
};
export const ParticipantList = <T,>({
  type,
  isLoading,
  hasError,
  hasNext,
  isLoadingMore,
  isLoadMoreFailed,
  items,
  filterItems,
  children,
  handleLoadMore,
  handleReload,
}: Props<T>) => {
  const intl = useIntl();
  const [searchQuery, setSearchQuery] = useState('');
  const { scrollBarRef, spinnerWrapperRef } = useInfiniteScroll({
    handleLoadMore,
    hasMore: hasNext,
    isLoadMoreFailed,
  });
  const filterItemsRef = useRef(filterItems);

  useEffect(() => {
    filterItemsRef.current = filterItems;
  });

  const filteredItems = useMemo(() => items.filter((item) => filterItemsRef.current({ item, query: searchQuery })), [
    searchQuery,
    items,
  ]);

  const errorView = useMemo(() => {
    const title = intl.formatMessage({ id: errorViewTitles[type] });

    const icon = icons[type];
    return (
      <InfiniteScrollComponents.ErrorView
        icon={icon}
        title={title}
        description={intl.formatMessage({
          id: 'chat.channelDetail.sidebar.openChannels.memberList.participants.error.failedToLoad.body',
        })}
        onRetry={() => handleReload()}
        isRetrying={isLoading}
        retryButtonLabel={intl.formatMessage({
          id: 'chat.channelDetail.sidebar.openChannels.memberList.error.failedToLoad.btn.retry',
        })}
      />
    );
  }, [handleReload, intl, isLoading, type]);

  const emptyView = useMemo(() => {
    if (filteredItems.length > 0) {
      return undefined;
    }

    if (items.length === 0 || !searchQuery) {
      return (
        <EmptyView
          icon={icons[type]}
          title={intl.formatMessage({ id: emptyViewLabels[type].title })}
          description={intl.formatMessage({ id: emptyViewLabels[type].body })}
        />
      );
    }

    return (
      <EmptyView
        icon="no-search"
        title={intl.formatMessage({ id: 'chat.channelDetail.sidebar.openChannels.memberList.search.empty.title' })}
        description={intl.formatMessage(
          { id: 'chat.channelDetail.sidebar.openChannels.memberList.search.empty.body' },
          { query: searchQuery },
        )}
      />
    );
  }, [filteredItems.length, items.length, searchQuery, intl, type]);

  const loadMoreErrorView = useMemo(
    () => (
      <InfiniteScrollComponents.LoadMoreError
        onRetry={handleLoadMore}
        isRetrying={isLoadingMore}
        retryButtonLabel={intl.formatMessage({
          id: 'chat.channelDetail.sidebar.openChannels.memberList.error.loadMore.btn.retry',
        })}
      >
        {intl.formatMessage({
          id: 'chat.channelDetail.sidebar.openChannels.memberList.error.loadMore.title',
        })}
      </InfiniteScrollComponents.LoadMoreError>
    ),
    [handleLoadMore, intl, isLoadingMore],
  );

  return (
    <ScrollBar
      ref={(ref) => {
        scrollBarRef(ref?.node ?? null);
      }}
      css="padding: 16px;"
    >
      <InputText
        role="searchbox"
        size="small"
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value.trim());
        }}
        placeholder={intl.formatMessage({
          id: 'chat.channelDetail.sidebar.openChannels.memberList.search.input.placeholder',
        })}
        icons={
          searchQuery
            ? [
                {
                  key: 'clear',
                  icon: 'close',
                  size: 'xsmall',
                  'aria-label': intl.formatMessage({
                    id: 'chat.channelDetail.sidebar.openChannels.memberList.search.input.btn.clear',
                  }),
                  onClick: () => {
                    setSearchQuery('');
                  },
                },
              ]
            : undefined
        }
      />
      {(() => {
        if (hasError) {
          return <EmptyViewWrapper>{errorView}</EmptyViewWrapper>;
        }

        if (isLoading) {
          return <SpinnerFull />;
        }

        if (emptyView) {
          return <EmptyViewWrapper>{emptyView}</EmptyViewWrapper>;
        }

        return (
          <MTUsers
            css={`
              margin-left: -16px;
              margin-right: -16px;
              padding-top: 8px;
            `}
          >
            {filteredItems.map(children)}
            {hasNext &&
              (isLoadMoreFailed
                ? loadMoreErrorView
                : // Hide spinner when showing search results
                  !searchQuery && <InfiniteScrollComponents.Spinner ref={spinnerWrapperRef} />)}
          </MTUsers>
        );
      })()}
    </ScrollBar>
  );
};
