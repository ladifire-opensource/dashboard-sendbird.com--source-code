import { useMemo, ComponentProps, FC, useEffect, useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';

import styled, { css } from 'styled-components';

import { Button, Dropdown, ContextualHelp, TooltipTrigger } from 'feather';

import { chatActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { GroupChannelSearchOperator } from '@constants';
import { useShowDialog, useAuthorization, useCurrentSdkUser } from '@hooks';
import { useQueryString } from '@hooks/useQueryString';
import { SearchInput, TablePageContainer, LoadMoreTable, PageHeader } from '@ui/components';

import { ModeratorActionButton } from '../ModeratorActionButton';
import { PlanUpgradeLink, ContactSalesLink, FeatureSettingLink } from '../PlanErrorResolutionLink';
import { useChannelListState, useChannelListActions } from '../hooks/useChannelList';
import { useChannelListTableProps } from '../hooks/useChannelListTableProps';
import { useFeatureAlert } from '../hooks/useFeatureAlert';
import { ModerationToolAvailability, useModerationToolAvailability } from '../hooks/useModerationToolAvailability';
import { groupChannelSearchOptions } from '../searchOptions';

enum ShowEmptyChannelsOption {
  Show = 'True',
  DoNotShow = 'False',
}

type SearchParams = {
  nickname?: string;
  userId?: string;
  url?: string;
  customType?: string;
  name?: string;
  nameStartswith?: string;
  membersIncludeIn?: string;
};

const defaultSearchParams: SearchParams = {
  nickname: undefined,
  userId: undefined,
  url: undefined,
  customType: undefined,
  name: undefined,
  nameStartswith: undefined,
  membersIncludeIn: undefined,
};

const Bold = styled.b`
  font-weight: 600;
`;

const Filter = styled.div`
  display: flex;
  flex-direction: row;
`;

export const GroupChannelList: FC = () => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const { sdkUser, isFetched: isSdkUserFetched } = useCurrentSdkUser();
  const dispatch = useDispatch();
  const showDialog = useShowDialog();

  const {
    selectedChannels,
    channels,
    search,
    isFetching,
    isFetchingLoadMore,
    next,
  } = useChannelListState<'group_channels'>();
  const showEmptyChannels = useSelector((state: RootState) => state.groupChannels.showEmptyChannels);

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
    setSearchSuccess,
  } = useChannelListActions<'group_channels'>();

  const tableProps = useChannelListTableProps<'group_channels'>({
    channelType: 'group_channels',
    onChannelClick: navigateToChannel,
    selectedChannels,
    onSelectedChannelsChange: setSelectedChannels,
    dataSource: channels,
    isLoading: isFetching,
  });

  const {
    nickname,
    userId,
    url,
    customType,
    name,
    nameStartswith,
    membersIncludeIn,
    updateParams,
    clearParams,
  } = useQueryString<SearchParams>(defaultSearchParams);

  const activeSearchParam = useMemo(() => {
    const [option, query] = ([
      [GroupChannelSearchOperator.urlEquals, url],
      [GroupChannelSearchOperator.customTypeEquals, customType],
      [GroupChannelSearchOperator.nameEquals, name],
      [GroupChannelSearchOperator.nameStartswith, nameStartswith],
      [GroupChannelSearchOperator.userIdEquals, userId],
      [GroupChannelSearchOperator.nicknameEquals, nickname],
      [GroupChannelSearchOperator.membersIncludeIn, membersIncludeIn],
    ] as [GroupChannelSearchOperator, string][]).find(([, query]) => query) || [null, null];

    return option && query ? { option, query } : null;
  }, [customType, membersIncludeIn, name, nameStartswith, nickname, url, userId]);

  useEffect(() => {
    if (activeSearchParam) {
      searchChannels({ ...activeSearchParam, init: true });
    } else {
      fetchChannels();
      setSearchSuccess(false);
    }
  }, [activeSearchParam, fetchChannels, searchChannels, showEmptyChannels, setSearchSuccess]);

  // Set the default search option on render based on query string and never change.
  const defaultSearchOption = useRef(
    groupChannelSearchOptions.find((option) => option.key === activeSearchParam?.option) ||
      groupChannelSearchOptions[0],
  );

  const handleSearchSubmit: ComponentProps<typeof SearchInput>['handleSubmit'] = (value, { key }) => {
    switch (key) {
      case GroupChannelSearchOperator.urlEquals:
        updateParams({ ...defaultSearchParams, url: value });
        break;
      case GroupChannelSearchOperator.customTypeEquals:
        updateParams({ ...defaultSearchParams, customType: value });
        break;
      case GroupChannelSearchOperator.nameEquals:
        updateParams({ ...defaultSearchParams, name: value });
        break;
      case GroupChannelSearchOperator.nameStartswith:
        updateParams({ ...defaultSearchParams, nameStartswith: value });
        break;
      case GroupChannelSearchOperator.userIdEquals:
        updateParams({ ...defaultSearchParams, userId: value });
        break;
      case GroupChannelSearchOperator.nicknameEquals:
        updateParams({ ...defaultSearchParams, nickname: value });
        break;
      case GroupChannelSearchOperator.membersIncludeIn:
        updateParams({ ...defaultSearchParams, membersIncludeIn: value });
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

  const showCreateGroupChannelDialog = useCallback(() => {
    if (sdkUser == null) {
      return;
    }
    showDialog({
      dialogTypes: DialogType.CreateGroupChannel,
      dialogProps: {
        sdkUser,
        onSuccess: (channel) => {
          navigateToChannel({ url: channel.url, customType: channel.customType });
          fetchChannels();
        },
      },
    });
  }, [fetchChannels, navigateToChannel, sdkUser, showDialog]);

  const featureAvailability = useModerationToolAvailability('group_channels');
  const isSdkUserUndefined = sdkUser == null;

  const titleActions = useMemo(() => {
    const isCreateChannelPermitted = isPermitted(['application.channels.groupChannel.all']);
    const isCreateChannelDisabled =
      !isCreateChannelPermitted || featureAvailability !== ModerationToolAvailability.Available || isSdkUserUndefined;

    const intlMessageValues = {
      b: (text: string) => <Bold>{text}</Bold>,
      planupgradelink: (text: string) => <PlanUpgradeLink alertType="dialog">{text}</PlanUpgradeLink>,
      contactsaleslink: (text: string) => <ContactSalesLink alertType="dialog">{text}</ContactSalesLink>,
      featuresettinglink: (text: string) => <FeatureSettingLink alertType="dialog">{text}</FeatureSettingLink>,
    };

    const disabledCreateChannelButtonTooltipContent = (() => {
      if (!isCreateChannelDisabled) {
        return null;
      }
      switch (featureAvailability) {
        case ModerationToolAvailability.NotSupported:
          return intl.formatMessage(
            { id: 'chat.groupChannels.list.btn.createChannel.disabled.tooltip.notSupported' },
            intlMessageValues,
          );
        case ModerationToolAvailability.V1OrgUnavailable:
          return intl.formatMessage(
            { id: 'chat.groupChannels.list.btn.createChannel.disabled.tooltip.v1OrgUnavailable' },
            intlMessageValues,
          );
        default:
          break;
      }

      if (!isCreateChannelPermitted) {
        return intl.formatMessage({ id: 'chat.channelList.btn.createChannel.disabled.tooltip.notPermitted' });
      }

      if (featureAvailability === ModerationToolAvailability.FeatureOff) {
        return intl.formatMessage(
          { id: 'chat.groupChannels.list.btn.createChannel.disabled.tooltip.featureOff' },
          intlMessageValues,
        );
      }
      if (isSdkUserFetched && isSdkUserUndefined) {
        return intl.formatMessage({ id: 'chat.channelList.list.tooltip.moderatorRequiredToCreateGroupChannel' });
      }
      return null;
    })();

    return (
      <>
        {featureAvailability === ModerationToolAvailability.Available && <ModeratorActionButton />}
        <ContextualHelp
          content={disabledCreateChannelButtonTooltipContent}
          placement="bottom-end"
          trigger={
            isCreateChannelDisabled && disabledCreateChannelButtonTooltipContent
              ? TooltipTrigger.Hover
              : TooltipTrigger.Manual
          }
          tooltipContentStyle="max-width: 256px;"
        >
          <Button
            buttonType="primary"
            icon="plus"
            size="small"
            disabled={isCreateChannelDisabled}
            css="margin-left: 8px;"
            onClick={showCreateGroupChannelDialog}
          >
            {intl.formatMessage({ id: 'chat.channelList.btn.createChannel' })}
          </Button>
        </ContextualHelp>
      </>
    );
  }, [featureAvailability, intl, isPermitted, isSdkUserFetched, isSdkUserUndefined, showCreateGroupChannelDialog]);

  const featureAlert = useFeatureAlert('group_channels');

  return (
    <TablePageContainer>
      <PageHeader>
        <PageHeader.Title>{intl.formatMessage({ id: 'chat.groupChannels.title' })}</PageHeader.Title>
        <PageHeader.Actions>{titleActions}</PageHeader.Actions>
        <PageHeader.Description
          css={`
            > * + * {
              margin-top: 16px;
            }
          `}
        >
          <p>{intl.formatMessage({ id: 'chat.groupChannels.list.description' })}</p>
          {featureAlert}
        </PageHeader.Description>
      </PageHeader>
      <Filter>
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
          options={groupChannelSearchOptions}
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
        <Dropdown<ShowEmptyChannelsOption>
          css={`
            margin-left: 4px;
          `}
          size="small"
          selectedItem={showEmptyChannels ? ShowEmptyChannelsOption.Show : ShowEmptyChannelsOption.DoNotShow}
          items={[ShowEmptyChannelsOption.Show, ShowEmptyChannelsOption.DoNotShow]}
          itemToString={(value) =>
            value === ShowEmptyChannelsOption.Show
              ? intl.formatMessage({ id: 'chat.groupChannels.list.channelFilter.allChannels' })
              : intl.formatMessage({ id: 'chat.groupChannels.list.channelFilter.channelsWithMessagesOnly' })
          }
          onChange={(selectedValue) => {
            if (selectedValue != null) {
              dispatch(chatActions.setGroupChannelShowEmptyChannels(selectedValue === ShowEmptyChannelsOption.Show));
            }
          }}
        />
      </Filter>

      <LoadMoreTable<Channel>
        css="min-width: 0;"
        {...tableProps}
        hasNext={!!next}
        loadMoreButtonProps={{ isLoading: isFetchingLoadMore, onClick: loadMoreChannels }}
      />
    </TablePageContainer>
  );
};
