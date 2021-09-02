import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { ScrollBar } from 'feather';

import * as InfiniteScrollComponents from '@chat/components/InfiniteScrollComponents';
import { useInfiniteScroll } from '@hooks';

import { MTUsers } from '../components';

type Props<T> = {
  type: 'members' | 'banned' | 'muted';
  items: T[];
  children: (item: T) => JSX.Element;
  hasMore: boolean;
  isLoadingMore?: boolean;
  isLoadMoreFailed: boolean;
  hasError?: boolean;
  handleLoadMore: () => void;
  handleReload: () => void;
};

export const MemberList = <T,>({
  type,
  items,
  children,
  hasMore,
  handleLoadMore,
  isLoadMoreFailed,
  isLoadingMore,
  hasError,
  handleReload,
}: Props<T>) => {
  const intl = useIntl();
  const { scrollBarRef, spinnerWrapperRef } = useInfiniteScroll({ handleLoadMore, hasMore, isLoadMoreFailed });
  const loadMoreErrorView = useMemo(
    () => (
      <InfiniteScrollComponents.LoadMoreError
        onRetry={handleLoadMore}
        isRetrying={isLoadingMore}
        retryButtonLabel={intl.formatMessage({ id: 'chat.groupChannels.info.error.loadMore.btn.retry' })}
      >
        {intl.formatMessage({ id: 'chat.groupChannels.info.error.loadMore.title' })}
      </InfiniteScrollComponents.LoadMoreError>
    ),
    [handleLoadMore, intl, isLoadingMore],
  );

  const errorView = useMemo(() => {
    const title = intl.formatMessage({
      id: {
        members: 'chat.groupChannels.info.members.error.failedToLoad.title',
        banned: 'chat.groupChannels.info.banned.error.failedToLoad.title',
        muted: 'chat.groupChannels.info.muted.error.failedToLoad.title',
      }[type],
    });
    const body = intl.formatMessage({
      id: {
        members: 'chat.groupChannels.info.members.error.failedToLoad.body',
        banned: 'chat.groupChannels.info.banned.error.failedToLoad.body',
        muted: 'chat.groupChannels.info.muted.error.failedToLoad.body',
      }[type],
    });
    const icon = ({ members: 'user', banned: 'ban', muted: 'mute' } as const)[type];
    return (
      <InfiniteScrollComponents.ErrorView
        icon={icon}
        title={title}
        description={body}
        onRetry={handleReload}
        retryButtonLabel={intl.formatMessage({ id: 'chat.groupChannels.info.error.failedToLoad.btn.retry' })}
      />
    );
  }, [handleReload, intl, type]);

  return (
    <ScrollBar
      ref={(ref) => {
        scrollBarRef(ref?.node ?? null);
      }}
    >
      <MTUsers>
        {items.map(children)}
        {hasMore &&
          (isLoadMoreFailed ? loadMoreErrorView : <InfiniteScrollComponents.Spinner ref={spinnerWrapperRef} />)}
      </MTUsers>
      {hasError && errorView}
    </ScrollBar>
  );
};
