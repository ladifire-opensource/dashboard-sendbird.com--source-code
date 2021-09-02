import lowerCase from 'lodash/lowerCase';

import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { openChannelSearchOptions, groupChannelSearchOptions } from '../searchOptions';
import { useChannelListState } from './useChannelList';

export const useEmptyView = () => {
  const {
    channelType,
    search: { query, option },
  } = useChannelListState();

  if (query) {
    const searchOptions: ChannelSearchOption<any>[] =
      channelType === 'open_channels' ? openChannelSearchOptions : groupChannelSearchOptions;
    const fieldName = lowerCase(searchOptions.find((item) => item.key === option)?.description ?? 'query');
    return (
      <CenteredEmptyState
        icon="channels"
        title="Channel not found"
        description={`Please make sure the ${fieldName} is correct`}
      />
    );
  }
  if (channelType === 'open_channels') {
    return (
      <CenteredEmptyState
        icon="channels"
        title="Create your first channel"
        description='Use the "Create channel" button above to get started'
      />
    );
  }
  return (
    <CenteredEmptyState
      icon="channels"
      title="You have no group channels"
      description="Please wait for your users to start a conversation"
    />
  );
};
