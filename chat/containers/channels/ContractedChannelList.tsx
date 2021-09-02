import { useCallback, useState, useMemo, useEffect, useRef, FC } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { IconName, cssVariables, Checkbox, ScrollBar, IconButton, Spinner } from 'feather';
import numbro from 'numbro';

import { useInfiniteScroll } from '@hooks';
import { Tooltip, SearchInput } from '@ui/components';

import { ContractedChannelListItem } from './ContractedChannelListItem';
import { useChannelListState, useChannelListActions } from './hooks/useChannelList';
import { useEmptyView } from './hooks/useEmptyView';
import { openChannelSearchOptions, groupChannelSearchOptions } from './searchOptions';
import { isOpenChannel, isGroupChannel } from './typeGuards';

interface TableMenuItem {
  label: string;
  icon: IconName;
  enabled: boolean;
  hasAttached?: boolean;
  isAttached?: boolean;
  onClick: () => void;
  testId: string;
}

const ContractedTooltip = styled(Tooltip)`
  & + & {
    margin-left: 6px;
  }
`;

const BackButton = styled(IconButton)`
  svg {
    fill: ${cssVariables('neutral-9')};
  }

  :hover {
    svg {
      fill: ${cssVariables('neutral-9')};
    }
  }
`;

const ContractedTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.2px;
  color: ${cssVariables('neutral-10')};
  margin-left: 8px;
`;

const ContractedContainer = styled.ul`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
`;

const ContractedCheckAll = styled.div`
  margin-right: 8px;
  margin-left: 10px;
`;

const CheckboxLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
  cursor: pointer;
`;

const ContractedSelectedCount = styled.div<{ isCancel: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${cssVariables('purple-7')};
  margin-left: auto;
  padding-right: 5px;

  ${(props) => (props.isCancel ? 'cursor: pointer;' : '')};
`;

const StyledContracted = styled.div`
  width: 319px;
  border-right: 1px solid ${cssVariables('neutral-3')};
`;

const ContractedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;

const ContractedHeader = styled.div`
  padding: 0 11px 0 8px;
  display: flex;
  align-items: center;
  position: relative;
  height: 64px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};

  ${ContractedCheckAll} + ${ContractedTooltip} {
    margin-left: 4px;
  }
`;

const SpinnerWrapper = styled.div`
  text-align: center;
  line-height: 0;
  padding: 32px;

  > * {
    display: inline-block;
  }
`;

const getUserCount = (channel: Channel) => {
  if (isOpenChannel(channel)) {
    return channel.participant_count;
  }
  if (isGroupChannel(channel)) {
    return channel.member_count;
  }
  return 0;
};

export const ContractedChannelList: FC = () => {
  const intl = useIntl();

  const { channelType, selectedChannels, channels, current, next, search, isFetching } = useChannelListState();

  const {
    setSelectedChannels,
    fetchChannels,
    searchChannels,
    setSearchSuccess,
    handleSearchClear,
    handleSearchQueryChange,
    handleSearchOptionChange,
    loadMoreChannels,
    navigateToChannel,
    navigateToList,
    editChannel,
    editChannelMetadata,
    sendAdminMessage,
    deleteChannels,
    setSearchState,
  } = useChannelListActions();

  const { scrollBarRef, spinnerWrapperRef } = useInfiniteScroll({ handleLoadMore: loadMoreChannels, hasMore: !!next });

  const [isEditing, setIsEditing] = useState(selectedChannels.length > 0);

  const hasSelectedChannels = selectedChannels.length > 0;

  useEffect(() => {
    if (hasSelectedChannels) {
      !isEditing && setIsEditing(true);
    }
  }, [hasSelectedChannels, isEditing]);

  const selectedChannelURLs = useMemo(() => selectedChannels.map((channel) => channel.channel_url), [selectedChannels]);
  const selectedCount = selectedChannels.length;
  const isAllChecked = channels.length > 0 && selectedCount === channels.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < channels.length;

  const handleCheckClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleCheckAllClick = useCallback(() => {
    setSelectedChannels(hasSelectedChannels ? [] : channels);
  }, [setSelectedChannels, hasSelectedChannels, channels]);

  const handleSearchChannelBlur = useRef<(() => void) | null>(null);

  useEffect(() => {
    handleSearchChannelBlur.current = () => {
      if (search.query === '') {
        if (search.isSuccess) {
          fetchChannels();
        }
        setSearchState(false);
      }
    };
  }, [fetchChannels, search.isSuccess, search.query, setSearchState]);

  const handleCancelClick = useCallback(() => {
    if (selectedCount === 0) {
      setIsEditing(false);
    }
  }, [selectedCount]);

  const title = channelType === 'open_channels' ? 'Open channels' : 'Group channels';

  const searchOptions: ChannelSearchOption<any>[] =
    channelType === 'open_channels' ? openChannelSearchOptions : groupChannelSearchOptions;

  const renderedDefaultHeader = useMemo(() => {
    const backTitle = (
      <>
        <BackButton icon="arrow-left" size="small" buttonType="primary" onClick={navigateToList} />
        <ContractedTitle>{title}</ContractedTitle>
      </>
    );

    const handleSearchClick = () => {
      setSearchState(true);
    };

    const handleSearchChannelFocus = () => {
      setSearchState(true);
    };

    const handleSearchChannelDocumentClick = (isOut) => {
      if (isOut && search.query === '' && search.isSearching) {
        setSearchState(false);
      }
    };

    const handleSearchSubmit = () => {
      if (search.query !== '') {
        searchChannels({ option: search.option, query: search.query, init: true });
      } else if (search.query === '') {
        fetchChannels();
        setSearchSuccess(false);
      }
    };

    return (
      <>
        {backTitle}
        <SearchInput
          styles={{
            SearchInput: css`
              margin-left: auto;
              ${search.isSearching || search.query !== ''
                ? css`
                    position: absolute;
                    left: 40px;
                    right: 7px;
                    &:focus {
                      border: 1px solid transparent;
                    }
                  `
                : ''}
            `,
            SearchIcon: css`
              margin-left: auto;
            `,
          }}
          isFetching={isFetching}
          value={search.query}
          defaultOption={
            search.option ? searchOptions.find((option) => option.key === search.option) : searchOptions[0]
          }
          options={searchOptions}
          handleFocus={handleSearchChannelFocus}
          handleBlur={() => handleSearchChannelBlur.current?.()}
          handleDocumentClick={handleSearchChannelDocumentClick}
          handleSearchClear={handleSearchClear}
          handleChange={handleSearchQueryChange}
          handleSubmit={handleSearchSubmit}
          handleOptionChange={handleSearchOptionChange}
          handleSearchClick={handleSearchClick}
          type="inline"
          mode={search.isSearching || search.query !== '' ? 'default' : 'icon'}
          preventBlur={true}
        />
      </>
    );
  }, [
    navigateToList,
    title,
    search.isSearching,
    search.query,
    search.option,
    isFetching,
    searchOptions,
    handleSearchClear,
    handleSearchQueryChange,
    handleSearchOptionChange,
    setSearchState,
    searchChannels,
    fetchChannels,
    setSearchSuccess,
  ]);

  const menuItems: TableMenuItem[] = [
    {
      label: intl.formatMessage({ id: 'chat.channelList.list.bulkAction.editChannel' }),
      icon: 'edit',
      enabled: selectedChannels.length === 1,
      hasAttached: true,
      onClick: () => editChannel(selectedChannels[0]),
      testId: 'EditButton',
    },
    {
      label: intl.formatMessage({ id: 'chat.channelList.list.bulkAction.editChannelMetadata' }),
      icon: 'metadata',
      enabled: selectedChannels.length === 1,
      isAttached: true,
      onClick: () => editChannelMetadata(selectedChannels[0]),
      testId: 'EditMetadataButton',
    },
    {
      label: intl.formatMessage({ id: 'chat.channelList.list.bulkAction.sendAdminMessage' }),
      icon: 'admin-message',
      enabled: selectedChannels.length > 0,
      onClick: () => sendAdminMessage(selectedChannels),
      testId: 'SendAdminMessageButton',
    },
    {
      label: intl.formatMessage({ id: 'chat.channelList.list.bulkAction.deleteChannels' }),
      icon: 'delete',
      enabled: selectedChannels.length > 0,
      onClick: () => deleteChannels(selectedChannels),
      testId: 'DeleteButton',
    },
  ];

  const emptyView = useEmptyView();

  const renderEditingHeader = () => {
    return (
      <>
        <ContractedCheckAll>
          <Checkbox checked={isAllChecked} indeterminate={isIndeterminate} onChange={handleCheckAllClick} />
        </ContractedCheckAll>
        {selectedCount === 0 ? <CheckboxLabel onClick={handleCheckAllClick}>Select All</CheckboxLabel> : ''}
        {menuItems.map((menu) => {
          if (menu.enabled) {
            return (
              <ContractedTooltip
                tag="span"
                target={
                  <IconButton
                    key={`contracted_menu_item_${menu.label}`}
                    icon={menu.icon as IconName}
                    size="small"
                    buttonType="primary"
                    onClick={menu.onClick}
                    data-test-id={menu.testId}
                  />
                }
                content={menu.label}
                placement="bottom"
                offset="0, 8"
              />
            );
          }
          return '';
        })}
        <ContractedSelectedCount onClick={handleCancelClick} isCancel={selectedCount === 0}>
          {selectedCount > 0 ? `${selectedCount} selected` : 'Cancel'}
        </ContractedSelectedCount>
      </>
    );
  };

  return (
    <StyledContracted data-test-id="ChannelList">
      <ContractedWrapper>
        <ContractedHeader>{isEditing ? renderEditingHeader() : renderedDefaultHeader}</ContractedHeader>
        <ContractedContainer>
          <ScrollBar
            ref={(ref) => {
              scrollBarRef(ref?.node ?? null);
            }}
          >
            {channels.length > 0 ? (
              <>
                {(channels as (OpenChannel | GroupChannel)[]).map((channel) => {
                  return (
                    <ContractedChannelListItem
                      key={`contracted_channels_${channel.channel_url}`}
                      channel={channel}
                      onClick={navigateToChannel}
                      onCheckClick={handleCheckClick}
                      isActive={current?.channel_url === channel.channel_url}
                      checked={selectedChannelURLs.includes(channel.channel_url)}
                      isEditing={isEditing}
                      userCount={numbro(getUserCount(channel)).format({ thousandSeparated: true, mantissa: 0 })}
                    />
                  );
                })}
                {next && (
                  <SpinnerWrapper ref={spinnerWrapperRef} data-test-id="LoadMoreSpinner">
                    <Spinner size={24} stroke={cssVariables('neutral-9')} />
                  </SpinnerWrapper>
                )}
              </>
            ) : (
              emptyView
            )}
          </ScrollBar>
        </ContractedContainer>
      </ContractedWrapper>
    </StyledContracted>
  );
};
