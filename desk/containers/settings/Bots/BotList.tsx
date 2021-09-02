import { FC, useEffect, useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  SpinnerFull,
  EmptyState,
  EmptyStateSize,
  Dropdown,
  Icon,
  cssVariables,
  Button,
  TooltipTargetIcon,
} from 'feather';
import isEqual from 'lodash/isEqual';

import { axios } from '@api';
import { AgentActivationStatusValue, AgentType, DeskBotType } from '@constants';
import * as deskApi from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAppId } from '@hooks';
import { useAsync } from '@hooks/useAsync';
import { useIsFAQBotEnabled } from '@hooks/useIsFAQBotEnabled';
import { useQueryString } from '@hooks/useQueryString';
import { AgentActivationContextualHelp } from '@ui/components';

import { BotCard } from './BotCard';

const defaultFetchDeskBotsLimit = 20;
const allTeamsItem = { id: -1 } as AgentGroup<'listItem'>;

type QueryParams = {
  group?: number;
  status?: AgentActivationStatusValue | AgentActivationStatusValue[];
  type?: DeskBotType;
};

type BotTypeFilterItem = { labelKey: string; value?: DeskBotType };
const botTypeFilterItems: BotTypeFilterItem[] = [
  { labelKey: 'desk.settings.bots.filter.botType.item.all', value: undefined },
  { labelKey: 'desk.settings.bots.filter.botType.item.faq', value: DeskBotType.FAQBOT },
  { labelKey: 'desk.settings.bots.filter.botType.item.custom', value: DeskBotType.CUSTOMIZED },
];

type BotStatusFilterItem = { labelKey: string; value: AgentActivationStatusValue | AgentActivationStatusValue[] };
const botStatusFilterItems: BotStatusFilterItem[] = [
  {
    labelKey: 'desk.settings.bots.filter.activeStatus.item.all',
    value: [
      AgentActivationStatusValue.ACTIVE,
      AgentActivationStatusValue.INACTIVE,
      AgentActivationStatusValue.PENDING,
      AgentActivationStatusValue.PAUSED,
    ],
  },
  { labelKey: 'desk.settings.bots.filter.activeStatus.item.activated', value: AgentActivationStatusValue.ACTIVE },
  { labelKey: 'desk.settings.bots.filter.activeStatus.item.deactivated', value: AgentActivationStatusValue.INACTIVE },
  { labelKey: 'desk.settings.bots.filter.activeStatus.item.pending', value: AgentActivationStatusValue.PENDING },
  { labelKey: 'desk.settings.bots.filter.activeStatus.item.paused', value: AgentActivationStatusValue.PAUSED },
];

const FiltersWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  [role='combobox'] + [role='combobox'] {
    margin-left: 4px;
  }
`;

const AllTeamsItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${Icon} {
    margin-right: 8px;
  }
`;

const ListWrapper = styled.div`
  ${EmptyState}, > [role='progressbar'] {
    margin: 178px auto 0;
    min-height: 484px;
  }
`;

const InfoIcon = styled(TooltipTargetIcon)`
  display: inline-flex;
  margin-left: 4px;
`;

const BotCardsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 24px;

  & > div:not(:first-of-type) {
    margin-top: 16px;
  }
`;

export const BotList: FC = () => {
  const intl = useIntl();
  const history = useHistory();
  const appId = useAppId();
  const { pid, region } = useProjectIdAndRegion();
  const { group, type, status, updateParams } = useQueryString<QueryParams>({
    group: allTeamsItem.id,
    status: botStatusFilterItems[0].value,
  });
  const isFAQBotEnabled = useIsFAQBotEnabled();

  const [bots, setBots] = useState<DeskBot[]>([]);

  const [{ status: fetchDeskBotsStatus, data: fetchDeskBotsData }, fetchDeskBots] = useAsync(
    (payload: FetchDeskBotsAPIPayload) => deskApi.fetchDeskBots(pid, region, payload),
    [pid, region],
  );
  const [{ status: loadMoreDeskBotsStatus, data: loadMoreDeskBotsData }, loadMoreDeskBots] = useAsync(
    (next: string) =>
      axios.get<FetchDeskBotsAPIResponse>(next, {
        headers: { Authorization: `Token ${localStorage.getItem('deskApiToken')}`, pid },
      }),
    [pid],
  );
  const [{ status: fetchAgentGroupsStatus, data: fetchAgentGroupsData }, fetchAgentGroups] = useAsync(
    (payload: FetchAgentGroupsPayload) => deskApi.fetchAgentGroups(pid, region, payload),
    [pid, region],
  );
  const next = bots.length > defaultFetchDeskBotsLimit ? loadMoreDeskBotsData?.data.next : fetchDeskBotsData?.data.next;
  const teams = fetchAgentGroupsData?.data.results ?? [];

  const isLoadingBots = fetchDeskBotsStatus === 'loading';
  const isLoadingAgentGroups = fetchAgentGroupsStatus === 'loading';

  const handleBotTypeFilterItemSelected = useCallback(
    (item: BotTypeFilterItem) => {
      if (item) {
        updateParams({ type: item.value });
      }
    },
    [updateParams],
  );

  const handleGroupFilterItemSelected = useCallback(
    (group: AgentGroup<'listItem'>) => {
      if (group) {
        updateParams({ group: group.id === allTeamsItem.id ? undefined : group.id });
      }
    },
    [updateParams],
  );

  const handleBotStatusFilterItemSelected = useCallback(
    (item: BotStatusFilterItem) => {
      if (item) {
        updateParams({ status: item.value });
      }
    },
    [updateParams],
  );

  const handleBotDelete = useCallback(
    (botId: number) => {
      const current = [...bots];
      current.splice(
        current.findIndex((bot) => bot.id === botId),
        1,
      );
      setBots(current);
    },
    [bots],
  );

  const handleLoadMoreButtonClick = useCallback(() => {
    if (next) {
      loadMoreDeskBots(next);
    }
  }, [loadMoreDeskBots, next]);

  useEffect(() => {
    fetchDeskBots({
      group: group === allTeamsItem.id ? undefined : group,
      status: status ?? botStatusFilterItems[0].value,
      type,
      offset: 0,
      limit: defaultFetchDeskBotsLimit,
    });
  }, [fetchDeskBots, group, status, type]);

  useEffect(() => {
    // WIP: load more?
    fetchAgentGroups({ offset: 0, limit: 100 });
  }, [fetchAgentGroups]);

  useEffect(() => {
    if (fetchDeskBotsStatus === 'success') {
      setBots(fetchDeskBotsData?.data.results ?? []);
    }
  }, [fetchDeskBotsData, fetchDeskBotsStatus]);

  useEffect(() => {
    if (loadMoreDeskBotsStatus === 'success') {
      setBots((bots) => [...bots, ...(loadMoreDeskBotsData?.data.results ?? [])]);
    }
  }, [loadMoreDeskBotsData, loadMoreDeskBotsStatus]);

  const content = useMemo(() => {
    if (bots.length === 0) {
      if (isLoadingBots) {
        return <SpinnerFull transparent={true} />;
      }

      return (
        <EmptyState
          title={intl.formatMessage({ id: 'desk.settings.bots.noResult.title' })}
          description={intl.formatMessage({ id: 'desk.settings.bots.noResult.desc' })}
          icon="bot"
          size={EmptyStateSize.Large}
        />
      );
    }

    return (
      <>
        {isLoadingBots && <SpinnerFull transparent={true} />}
        <BotCardsWrapper>
          {bots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              onClick={() =>
                history.push(`/${appId}/desk/settings/bots/${bot.id}/edit?bot_type=${bot.type}`, {
                  backUrl: `${location.pathname}${location.search}`,
                })
              }
              onDelete={handleBotDelete}
            />
          ))}
          {next && (
            <Button
              buttonType="tertiary"
              isLoading={loadMoreDeskBotsStatus === 'loading'}
              css={css`
                width: 100%;
                margin-top: 24px;
              `}
              onClick={handleLoadMoreButtonClick}
            >
              {intl.formatMessage({ id: 'desk.settings.bots.list.button.loadMore' })}
            </Button>
          )}
        </BotCardsWrapper>
      </>
    );
  }, [
    appId,
    bots,
    handleBotDelete,
    handleLoadMoreButtonClick,
    history,
    intl,
    isLoadingBots,
    loadMoreDeskBotsStatus,
    next,
  ]);

  return (
    <>
      <FiltersWrapper data-test-id="BotFilters">
        {isFAQBotEnabled && (
          <Dropdown<BotTypeFilterItem>
            size="small"
            items={botTypeFilterItems}
            itemToString={({ labelKey }) => intl.formatMessage({ id: labelKey })}
            initialSelectedItem={botTypeFilterItems[0]}
            selectedItem={botTypeFilterItems.find(({ value }) => isEqual(value, type))}
            disabled={isLoadingBots}
            onItemSelected={handleBotTypeFilterItemSelected}
          />
        )}
        <Dropdown<AgentGroup<'listItem'>>
          size="small"
          items={[allTeamsItem, ...teams]}
          itemToString={(group) =>
            group.id === allTeamsItem.id
              ? intl.formatMessage({ id: 'desk.settings.bots.filter.teams.item.all' })
              : group.name
          }
          itemToElement={(group, isSelected) => {
            if (group.id === allTeamsItem.id) {
              return (
                <AllTeamsItemWrapper>
                  <Icon
                    icon="teams"
                    size={20}
                    color={isSelected ? cssVariables('purple-7') : cssVariables('neutral-10')}
                  />
                  {intl.formatMessage({ id: 'desk.settings.bots.filter.teams.item.all' })}
                </AllTeamsItemWrapper>
              );
            }
            return group.name;
          }}
          initialSelectedItem={allTeamsItem}
          selectedItem={teams.find((team) => team.id === group)}
          disabled={isLoadingAgentGroups || isLoadingBots}
          onItemSelected={handleGroupFilterItemSelected}
        />
        <Dropdown<BotStatusFilterItem>
          size="small"
          items={botStatusFilterItems}
          itemToString={({ labelKey }) => intl.formatMessage({ id: labelKey })}
          initialSelectedItem={botStatusFilterItems[0]}
          selectedItem={botStatusFilterItems.find(({ value }) => isEqual(value, status))}
          disabled={isLoadingBots}
          onItemSelected={handleBotStatusFilterItemSelected}
        />
        <AgentActivationContextualHelp
          placement="bottom-end"
          agentType={AgentType.BOT}
          popperProps={{
            modifiers: {
              offset: {
                offset: '20, 4',
              },
            },
          }}
        >
          <InfoIcon icon="info" />
        </AgentActivationContextualHelp>
      </FiltersWrapper>
      <ListWrapper>{content}</ListWrapper>
    </>
  );
};
