import { FC, useEffect, useState, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { ContextualHelp, InlineNotification, TooltipProps } from 'feather';
import { Dropdown, Icon, Subtitles, transitionDefault, cssVariables, DropdownProps, Spinner } from 'feather';
import throttle from 'lodash/throttle';

import { searchAgentGroups, fetchAgentGroups, fetchAgentGroup } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAppId, useAsync, useErrorToast } from '@hooks';
import { InfoTooltip } from '@ui/components';
import { sortToDefaultTeamFirst, getIsDefaultTeam } from '@utils';

const DropdownToggleWrapper = styled.div<{ isOpen: boolean }>`
  display: flex;
  padding: 6px 0;
  margin-left: 16px;
  ${Subtitles['subtitle-01']}

  svg {
    margin-right: 8px;
    transition: fill 0.2s ${transitionDefault};
    ${({ isOpen }) => isOpen && `fill: ${cssVariables('purple-7')};`}
  }
`;

const EmptyViewWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 104px;
  ${Subtitles['subtitle-01']}
  color: ${cssVariables('neutral-5')};
`;

const InlineItemNotificationWrapper = styled.div`
  margin-bottom: -4px;
  width: 100%;
`;

const InlineItemNotification = styled(InlineNotification)`
  width: calc(100% + 8px);
  transform: translate(-4px, 4px);
  border-radius: 0;

  a {
    color: ${cssVariables('neutral-10')};
    text-decoration: underline;

    &:hover {
      color: ${cssVariables('neutral-6')};
    }
  }
`;

const ALL_TEAM_ID = -1;

const AGENT_GROUPS_LIMIT = 100;

type Props = {
  selectedAgentGroupId?: AgentGroup<'listItem'>['id'] | null;
  selectedAgentGroup?: AgentGroup<'listItem'> | null;
  dropdownProps?: Partial<
    Pick<
      DropdownProps<AgentGroup<'listItem'>>,
      'size' | 'variant' | 'placement' | 'width' | 'disabled' | 'toggleRenderer'
    >
  >;
  disabledItemTooltipContent?: TooltipProps['content'];
  disabled?: boolean;
  isAllTeamOptionAvailable?: boolean;
  isBotOnly?: boolean;
  hasError?: boolean;
  className?: string;
  filterItems?: (item: AgentGroup<'listItem'>) => boolean;
  isItemDisabled?: (item: AgentGroup<'listItem'>) => boolean;
  onItemSelected?: (item: AgentGroup<'listItem'>) => void;
  onChange?: DropdownProps<AgentGroup<'listItem'>>['onChange'];
};

export const AgentGroupsSearchDropdown: FC<Props> = ({
  selectedAgentGroupId = null,
  selectedAgentGroup = null,
  dropdownProps,
  disabledItemTooltipContent,
  disabled,
  isAllTeamOptionAvailable,
  isBotOnly,
  hasError,
  className,
  filterItems,
  isItemDisabled,
  onItemSelected,
  onChange,
}) => {
  const intl = useIntl();
  const appId = useAppId();
  const { pid, region } = useProjectIdAndRegion();
  const [team, setTeam] = useState<AgentGroup<'listItem'> | null>(selectedAgentGroup);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [
    { data: fetchAgentGroupsData, status: fetchAgentGroupsStatus, error: fetchAgentGroupsError },
    fetchAgentGroupsAPI,
  ] = useAsync(async () => fetchAgentGroups(pid, region, { offset: 0, limit: AGENT_GROUPS_LIMIT }), [pid, region], {
    status: 'loading',
  });

  const [
    { data: fetchBotAgentGroupsData, status: fetchBotAgentGroupsStatus, error: fetchBotAgentGroupsError },
    fetchBotAgentGroupsAPI,
  ] = useAsync(
    async () => fetchAgentGroups(pid, region, { offset: 0, limit: AGENT_GROUPS_LIMIT, isBotOnly }),
    [isBotOnly, pid, region],
    { status: 'loading' },
  );

  const [
    { data: searchAgentGroupsData, status: searchAgentGroupsStatus, error: searchAgentGroupsError },
    searchAgentGroupsAPI,
  ] = useAsync(async (query: string) => await searchAgentGroups(pid, region, { name: query }), [pid, region]);

  const [
    { data: fetchAgentGroupData, status: fetchAgentGroupStatus, error: fetchAgentGroupError },
    fetchAgentGroupByIdAPI,
  ] = useAsync(async (groupId: AgentGroup['id']) => await fetchAgentGroup(pid, region, { groupId }), [pid, region]);

  const isLoading = useMemo(() => {
    const isLoadingBasicAgentGroupAPI = [
      fetchAgentGroupsStatus,
      searchAgentGroupsStatus,
      fetchAgentGroupStatus,
    ].includes('loading');
    const isLoadingBotAgentGroupAPI = fetchBotAgentGroupsStatus === 'loading';

    if (isBotOnly) {
      return isLoadingBasicAgentGroupAPI || isLoadingBotAgentGroupAPI;
    }

    return isLoadingBasicAgentGroupAPI;
  }, [fetchAgentGroupStatus, fetchAgentGroupsStatus, fetchBotAgentGroupsStatus, isBotOnly, searchAgentGroupsStatus]);

  const isServerError = useMemo(() => {
    const isErrorBasicAgentGroupAPI = [fetchAgentGroupsStatus, searchAgentGroupsStatus, fetchAgentGroupStatus].some(
      (status) => status === 'error',
    );
    const isErrorBotAgentGroupAPI = fetchBotAgentGroupsStatus === 'error';

    if (isBotOnly) {
      return isErrorBasicAgentGroupAPI || isErrorBotAgentGroupAPI;
    }

    return isErrorBasicAgentGroupAPI;
  }, [fetchAgentGroupStatus, fetchAgentGroupsStatus, fetchBotAgentGroupsStatus, isBotOnly, searchAgentGroupsStatus]);

  useErrorToast(searchAgentGroupsError || fetchBotAgentGroupsError || fetchAgentGroupsError || fetchAgentGroupError, {
    ignoreDuplicates: true,
  });

  const allTeamsOption = useMemo(
    () => ({
      id: ALL_TEAM_ID,
      name: intl.formatMessage({ id: 'desk.team.allTeam' }),
      key: null,
      description: null,
      project: 0,
      createdAt: '',
      createdBy: 0,
      memberCount: 0,
    }),
    [intl],
  );

  useEffect(() => {
    if (selectedAgentGroup != null) {
      setTeam(selectedAgentGroup);
      return;
    }
    if (typeof selectedAgentGroupId === 'number' && selectedAgentGroupId > 0) {
      fetchAgentGroupByIdAPI(selectedAgentGroupId);
      return;
    }

    if (isAllTeamOptionAvailable) {
      setTeam(allTeamsOption);
      return;
    }

    setTeam(null);
  }, [allTeamsOption, fetchAgentGroupByIdAPI, isAllTeamOptionAvailable, selectedAgentGroup, selectedAgentGroupId]);

  useEffect(() => {
    fetchAgentGroupsAPI();
    if (isBotOnly) {
      fetchBotAgentGroupsAPI();
    }
  }, [fetchAgentGroupsAPI, fetchBotAgentGroupsAPI, isBotOnly]);

  useEffect(() => {
    if (fetchAgentGroupData?.data) {
      const { members, ...agentGroupCommonData } = fetchAgentGroupData.data;
      const selectedTeam: AgentGroup<'listItem'> = { ...agentGroupCommonData, memberCount: members.length };
      setTeam(selectedTeam);
    }
  }, [fetchAgentGroupData]);

  const handleSearchChange = useCallback(
    (query: string) => {
      throttle(() => {
        searchAgentGroupsAPI(query);
      }, 200)();

      if (isSearchMode && query === '') {
        setIsSearchMode(false);
        return;
      }
      if (!isSearchMode && query !== '') {
        setIsSearchMode(true);
        return;
      }
    },
    [isSearchMode, searchAgentGroupsAPI],
  );

  const handleItemSelected = useCallback(
    (item: AgentGroup<'listItem'>) => {
      // TODO: escape 'ESC' key
      if (item) {
        onItemSelected?.(item);
      }
    },
    [onItemSelected],
  );

  const rawItems: AgentGroup<'listItem'>[] = useMemo(() => {
    if (isLoading || isServerError) {
      return [];
    }
    if (isSearchMode) {
      return searchAgentGroupsData?.data.results.sort((x, y) => x.name.localeCompare(y.name)) || [];
    }

    return [...(fetchAgentGroupsData?.data.results ?? [])].sort(sortToDefaultTeamFirst);
  }, [fetchAgentGroupsData, isLoading, isSearchMode, isServerError, searchAgentGroupsData]);

  const items = useMemo(() => {
    const noFilteredItems = isAllTeamOptionAvailable ? [allTeamsOption, ...rawItems] : rawItems;
    return filterItems ? noFilteredItems.filter(filterItems) : noFilteredItems;
  }, [isAllTeamOptionAvailable, allTeamsOption, rawItems, filterItems]);

  const isNoneOfTeamHasBotAgent = fetchBotAgentGroupsData?.data.results.length === 0 ?? false;
  const checkIsItemDisabled = (item: AgentGroup<'listItem'> | null) => {
    if (item != null) {
      const disabledByProp = isItemDisabled?.(item) ?? false;

      if (isBotOnly) {
        const isBotNotIncluded =
          fetchBotAgentGroupsData?.data.results.every((botIncludedTeam) => botIncludedTeam.id !== item.id) ?? false;
        return isBotNotIncluded || disabledByProp;
      }

      return disabledByProp;
    }
    return false;
  };

  return (
    <Dropdown<AgentGroup<'listItem'>>
      size="small"
      variant="inline"
      placement="bottom-end"
      css={css`
        & + ul {
          width: ${dropdownProps?.width || '276px'};
        }

        ${dropdownProps?.variant === 'default' &&
        css`
          &:hover:enabled {
            svg {
              fill: ${cssVariables('purple-7')};
            }
          }
        `}
      `}
      {...dropdownProps}
      items={items}
      itemToString={(item) => item.id.toString()}
      itemToElement={(item) => {
        const isAllTeam = item.id === ALL_TEAM_ID;
        const isDisabled = checkIsItemDisabled(item);

        if (isDisabled) {
          const contextualHelpContent = isBotOnly
            ? intl.formatMessage({ id: 'desk.team.teamSelect.dropdown.item.contextualHelp.noBotIncluded' })
            : disabledItemTooltipContent;
          return (
            <ContextualHelp
              content={contextualHelpContent}
              placement="right"
              popperProps={{ modifiers: { offset: { offset: '0, 12px' } } }}
            >
              {item.name}
            </ContextualHelp>
          );
        }

        if (!isAllTeam && getIsDefaultTeam(item.key)) {
          return (
            <>
              {intl.formatMessage({ id: 'desk.team.defaultTeam' })}
              <InfoTooltip
                content={intl.formatMessage({ id: 'desk.team.defaultTeam.tooltip' })}
                placement="right"
                popperProps={{ modifiers: { offset: { offset: '0, 4px' } }, positionFixed: true }}
                portalId="portal_tooltip"
                tooltipContentStyle={css`
                  max-width: 280px;
                `}
                css={`
                  margin-left: 4px;
                `}
              />
            </>
          );
        }

        return item.name;
      }}
      isItemDisabled={checkIsItemDisabled}
      selectedItem={team}
      useSearch={true}
      searchPlaceholder={intl.formatMessage({ id: 'desk.team.teamSelect.dropdown.search.placeholder' })}
      header={
        isBotOnly &&
        isNoneOfTeamHasBotAgent && (
          <InlineItemNotificationWrapper>
            <InlineItemNotification
              type="info"
              message={intl.formatMessage(
                { id: 'desk.team.teamSelect.dropdown.item.inlineNotification.noBotIncludedTeam' },
                {
                  span: (addABotToTeamText) => <Link to={`/${appId}/desk/settings/teams`}>{addABotToTeamText}</Link>,
                  a: (createABotText) => <Link to={`/${appId}/desk/settings/bots`}>{createABotText}</Link>,
                },
              )}
            />
          </InlineItemNotificationWrapper>
        )
      }
      disabled={disabled || isLoading}
      hasError={hasError || isServerError}
      onSearchChange={handleSearchChange}
      toggleRenderer={(params) => {
        if (dropdownProps?.toggleRenderer) {
          return dropdownProps.toggleRenderer(params);
        }

        const { selectedItem, isOpen } = params;
        const isAllTeamSelected = selectedItem?.id === ALL_TEAM_ID;
        const isDefaultTeamSelected = getIsDefaultTeam(selectedItem?.key ?? null);
        const selectedName = (() => {
          if (!selectedItem) {
            return intl.formatMessage({ id: 'desk.team.teamSelect.dropdown.item.placeholder' });
          }

          if (!isAllTeamSelected && isDefaultTeamSelected) {
            return intl.formatMessage({ id: 'desk.team.defaultTeam' });
          }

          return selectedItem.name;
        })();

        return (
          <DropdownToggleWrapper isOpen={isOpen} data-test-id="DropdownToggleWrapper">
            {!isAllTeamSelected && (
              <Icon
                icon="teams"
                size={20}
                color={(!isOpen && !selectedItem && cssVariables('neutral-6')) || undefined}
              />
            )}
            {selectedName}
          </DropdownToggleWrapper>
        );
      }}
      emptyView={
        <EmptyViewWrapper>
          {isLoading ? <Spinner /> : intl.formatMessage({ id: 'desk.team.teamSelect.dropdown.noResult' })}
        </EmptyViewWrapper>
      }
      className={className}
      onItemSelected={handleItemSelected}
      onChange={onChange}
    />
  );
};
