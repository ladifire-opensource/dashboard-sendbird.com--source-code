import { useMemo, ComponentProps, FC, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

import { css } from 'styled-components';

import { Button, ContextualHelp, TooltipTrigger, InlineNotification, Link, LinkVariant } from 'feather';

import { useDynamicPartitioningConversion } from '@chat/containers/settings/ChannelsSettings/DynamicPartitioningConverter/useDynamicPartitioningConversion';
import { useCurrentDynamicPartitioningOption } from '@chat/containers/settings/ChannelsSettings/hooks';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { OpenChannelSearchOperator } from '@constants';
import { useShowDialog, useAuthorization } from '@hooks';
import { useQueryString } from '@hooks/useQueryString';
import { SearchInput, LoadMoreTable, PageHeader, TablePageContainer } from '@ui/components';

import { ModeratorActionButton } from '../ModeratorActionButton';
import { useChannelListState, useChannelListActions } from '../hooks/useChannelList';
import { useChannelListTableProps } from '../hooks/useChannelListTableProps';
import { useFeatureAlert } from '../hooks/useFeatureAlert';
import { ModerationToolAvailability, useModerationToolAvailability } from '../hooks/useModerationToolAvailability';
import { openChannelSearchOptions } from '../searchOptions';
import { DynamicPartitioningOptionTag } from './DynamicPartitioningOptionTag';

type SearchParams = { nameContains?: string; url?: string; customType?: string };

const defaultSearchParams: SearchParams = { url: undefined, customType: undefined, nameContains: undefined };

export const OpenChannelList: FC = () => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();

  const {
    selectedChannels,
    channels,
    search,
    isFetching,
    isFetchingLoadMore,
    next,
  } = useChannelListState<'open_channels'>();
  const {
    setSelectedChannels,
    fetchChannels,
    handleSearchClear,
    handleSearchQueryChange,
    handleSearchOptionChange,
    loadMoreChannels,
    navigateToChannel,
    setSearchState,
    searchChannels,
  } = useChannelListActions<'open_channels'>();

  const tableProps = useChannelListTableProps<'open_channels'>({
    channelType: 'open_channels',
    onChannelClick: navigateToChannel,
    selectedChannels,
    onSelectedChannelsChange: setSelectedChannels,
    dataSource: channels,
    isLoading: isFetching,
  });

  const { nameContains, url, customType, updateParams, clearParams } = useQueryString<SearchParams>(
    defaultSearchParams,
  );

  const activeSearchParam = useMemo(() => {
    const [option, query] = ([
      [OpenChannelSearchOperator.urlEquals, url],
      [OpenChannelSearchOperator.customTypeEquals, customType],
      [OpenChannelSearchOperator.nameContains, nameContains],
    ] as [OpenChannelSearchOperator, string][]).find(([, query]) => query) || [null, null];

    return option && query ? { option, query } : null;
  }, [customType, nameContains, url]);

  useEffect(() => {
    if (activeSearchParam) {
      searchChannels({ ...activeSearchParam, init: true });
    } else {
      fetchChannels();
    }
  }, [activeSearchParam, fetchChannels, searchChannels]);

  // Set the default search option on render based on query string and never change.
  const defaultSearchOption = useRef(
    openChannelSearchOptions.find((option) => option.key === activeSearchParam?.option) || openChannelSearchOptions[0],
  );

  const handleSearchSubmit: ComponentProps<typeof SearchInput>['handleSubmit'] = (value, { key }) => {
    switch (key) {
      case OpenChannelSearchOperator.urlEquals:
        updateParams({ ...defaultSearchParams, url: value });
        break;
      case OpenChannelSearchOperator.customTypeEquals:
        updateParams({ ...defaultSearchParams, customType: value });
        break;
      case OpenChannelSearchOperator.nameContains:
        updateParams({ ...defaultSearchParams, nameContains: value });
        break;
      default:
        return;
    }
  };

  const handleSearchChannelFocus = () => {
    setSearchState(true);
  };

  const handleSearchChannelBlur = () => {
    if (search.query === '') {
      if (search.isSuccess) {
        fetchChannels();
      }
      setSearchState(false);
    }
  };

  const handleSearchChannelDocumentClick = (isOut) => {
    if (isOut && search.query === '' && search.isSearching) {
      setSearchState(false);
    }
  };

  const showDialog = useShowDialog();
  const { isUsingDynamicPartitioning } = useCurrentDynamicPartitioningOption();
  const featureAvailability = useModerationToolAvailability('open_channels');
  const isCreateChannelPermitted = isPermitted(['application.channels.openChannel.all']);
  const isCreateChannelDisabled = !isCreateChannelPermitted;
  const { conversionState, confirmConversion } = useDynamicPartitioningConversion();

  const featureAlert = useFeatureAlert('open_channels');

  const handleCreateChannel = () => showDialog({ dialogTypes: DialogType.CreateOpenChannel });

  const renderDynamicPartitioningUnavailableAlert = () => {
    switch (conversionState) {
      case 'running':
      case 'migrationDone':
      case 'retrying':
        return (
          <InlineNotification
            type="info"
            message={intl.formatMessage({ id: 'chat.openChannels.list.dynamicPartitioningConversion.running.body' })}
          />
        );

      case 'failed':
      case 'never':
      case 'unknown':
        return (
          <InlineNotification
            type="info"
            message={intl.formatMessage(
              { id: 'chat.openChannels.list.dynamicPartitioningConversion.body' },
              {
                convert: (text) => (
                  <Link variant={LinkVariant.Inline} role="button" onClick={confirmConversion}>
                    {text}
                  </Link>
                ),
                docs: (text) => (
                  <Link
                    variant={LinkVariant.Inline}
                    href="https://sendbird.com/docs/chat/v3/platform-api/guides/open-channel"
                    target="_blank"
                    iconProps={{ icon: 'open-in-new', size: 16 }}
                  >
                    {text}
                  </Link>
                ),
              },
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <TablePageContainer>
      <PageHeader>
        <PageHeader.Title>
          {intl.formatMessage({ id: 'chat.openChannels.list.title' })}
          <DynamicPartitioningOptionTag
            conversionState={conversionState}
            css={`
              margin-left: 8px;
            `}
          />
        </PageHeader.Title>
        <PageHeader.Actions>
          {featureAvailability === ModerationToolAvailability.Available && <ModeratorActionButton />}
          <ContextualHelp
            content={intl.formatMessage({ id: 'chat.channelList.btn.createChannel.disabled.tooltip.notPermitted' })}
            placement="bottom-end"
            trigger={isCreateChannelDisabled ? TooltipTrigger.Hover : TooltipTrigger.Manual}
            tooltipContentStyle="max-width: 256px;"
          >
            <Button
              buttonType="primary"
              size="small"
              icon="plus"
              onClick={handleCreateChannel}
              disabled={isCreateChannelDisabled}
              css={`
                margin-left: 8px;
              `}
            >
              {intl.formatMessage({ id: 'chat.channelList.btn.createChannel' })}
            </Button>
          </ContextualHelp>
        </PageHeader.Actions>
        <PageHeader.Description
          css={`
            > * + * {
              margin-top: 16px;
            }
          `}
        >
          {isUsingDynamicPartitioning ? (
            <p>{intl.formatMessage({ id: 'chat.openChannels.list.description' })}</p>
          ) : (
            renderDynamicPartitioningUnavailableAlert()
          )}
          {featureAlert}
        </PageHeader.Description>
      </PageHeader>

      <SearchInput
        styles={{
          SearchInput: css`
            width: 450px;
            height: 32px;
            @media (max-width: 1440px) {
              width: 400px;
            }
            @media (max-width: 1200px) {
              width: 300px;
            }
          `,
        }}
        isFetching={isFetching}
        value={search.query}
        defaultOption={defaultSearchOption.current}
        options={openChannelSearchOptions}
        handleFocus={handleSearchChannelFocus}
        handleBlur={handleSearchChannelBlur}
        handleDocumentClick={handleSearchChannelDocumentClick}
        handleSearchClear={() => {
          handleSearchClear();
          clearParams();
        }}
        handleChange={handleSearchQueryChange}
        handleSubmit={handleSearchSubmit}
        handleOptionChange={handleSearchOptionChange}
      />

      <LoadMoreTable<Channel>
        css="min-width: 0;"
        {...tableProps}
        hasNext={!!next}
        loadMoreButtonProps={{ onClick: loadMoreChannels, isLoading: isFetchingLoadMore }}
      />
    </TablePageContainer>
  );
};
