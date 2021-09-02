import { useEffect, useCallback, useContext, useState, FC, useMemo, ComponentProps, memo, MouseEvent } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  Table,
  TableProps,
  Dropdown,
  toast,
  transitionDefault,
  TableColumnProps,
  Tooltip,
  DropdownProps,
  TooltipTargetIcon,
  OverflowMenu,
  OverflowMenuProps,
} from 'feather';
import startCase from 'lodash/startCase';

import { deskApi } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import {
  LIST_LIMIT,
  AgentTier,
  AgentType,
  AgentConnection,
  SortOrder,
  DEFAULT_PAGE_SIZE_OPTIONS,
  AgentActivationStatusValue,
  EMPTY_TEXT,
} from '@constants';
import { fetchAgentTicketCounts } from '@desk/api';
import { AdminContext } from '@desk/contexts/AdminContext';
import { useDeskAgent, useShowDialog } from '@hooks';
import { useDeskAgentActivation } from '@hooks/useDeskAgentActivation';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { useQueryString } from '@hooks/useQueryString';
import {
  ConnectionLabel,
  Paginator,
  DrawerContext,
  drawerTransitionDurationSecond,
  BasicSearchBar,
  AgentItem,
  AgentActivationStatus,
  AgentActivationContextualHelp,
  TextWithOverflowTooltip,
  CopyButton,
  PageHeader,
  TablePageContainer,
} from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { PropOf, onDropdownChangeIgnoreNull } from '@utils';
import { logException } from '@utils/logException';

import { AgentRole } from '../../../constants/desk';
import { AgentListFilters } from './AgentListFilters';
import { drawerID as agentDrawerID } from './agentDetailSidebar';
import { AgentItemDuration } from './agentItemDuration';

export enum AgentsSortBy {
  NAME = 'display_name',
  TIER = 'tier',
  SENDBIRD_ID = 'sendbird_id',
  GROUP_COUNT = 'group_count',
  CONNECTION = 'connection',
  EMAIL = 'email',
  CONNECTION_UPDATED_AT = 'connection_updated_at',
  ACTIVATION_STATUS = 'status',
}

type FilterOption<T> = { label: string; value: T };

type AgentConnectionDropdownItem = FilterOption<Agent['connection']>;

const CopySendbirdIDButton = styled(CopyButton)`
  margin: -3px 0;
  margin-left: 4px;
`;

const AgentAction = styled.div`
  display: flex;
  align-items: center;
  margin-left: 4px;
  color: ${cssVariables('neutral-9')};
`;

const AgentActionLabel = styled(ConnectionLabel)`
  margin-right: 6px;
`;

const AgentActionText = styled.span``;

const AgentListTable = styled((props: TableProps<Agent>) => Table(props))`
  flex: 1;
  margin-top: 16px;
  height: 100%;

  tr:not(:hover) ${CopySendbirdIDButton} {
    display: none;
  }

  td {
    overflow: visible;
  }
`;

const AgentListPaginator = styled(Paginator)`
  margin-left: auto;
`;

const StyledAgentList = styled(TablePageContainer)<{
  isDetailOpen: boolean;
}>`
  ${PageHeader} + * {
    margin-top: 24px;
  }

  ${AgentListPaginator} {
    transform: translateX(${(props) => (props.isDetailOpen ? '-282px' : 0)});
    transition: transform ${drawerTransitionDurationSecond}s ${transitionDefault};
  }
`;

const AgentTierLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};
`;

const AgentTierToggle = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  padding-left: 4px;
`;

const AgentConnectionDropdown = styled((props: DropdownProps<AgentConnectionDropdownItem>) => <Dropdown {...props} />)`
  margin-top: -2px;
  height: 24px;
`;

const AgentActionItem = styled.div`
  display: flex;
  align-items: center;
`;

const TableHeadStatusContainer = styled.div`
  display: flex;
  align-items: center;
`;

const TableHeadStatusText = styled.span`
  display: inline-block;
`;

const TableHeadStatusInfoIcon = styled(TooltipTargetIcon)`
  display: inline-flex;
`;

export type SearchParams = {
  page: number;
  pageSize: PerPage;
  agentTypes?: string;
  sortBy?: AgentsSortBy;
  sortOrder?: SortOrder;
  teamIds?: string | undefined;
  connection?: 'ALL' | Agent['connection'] | undefined;
  level?: AgentTier | undefined;
  query?: string | undefined;
  activationStatus?: AgentActivationStatusValue;
};

type AgentTierDropdownProps = {
  tier: Agent['tier'];
  onItemSelected: (tier: Agent['tier']) => void;
};

const agentTierLabelIntlKeys: Record<AgentTier, string> = {
  [AgentTier.INTERMEDIATE]: 'desk.agent.tier.intermediate',
  [AgentTier.EXPERT]: 'desk.agent.tier.expert',
};

const useAgentTierDropdownItems = () => {
  const intl = useIntl();
  return useMemo(
    () =>
      [AgentTier.INTERMEDIATE, AgentTier.EXPERT].map((tier) => ({
        label: intl.formatMessage({ id: agentTierLabelIntlKeys[tier] }),
        value: tier,
      })),
    [intl],
  );
};

const AgentTierDropdown = memo<AgentTierDropdownProps>(({ tier, onItemSelected }) => {
  const items = useAgentTierDropdownItems();

  return (
    <Dropdown
      size="small"
      variant="inline"
      selectedItem={items.find((item) => item.value === tier) || items[0]}
      items={items}
      itemToString={(item) => item.label}
      positionFixed={true}
      toggleRenderer={({ selectedItem, isOpen }) =>
        selectedItem && (
          <AgentTierToggle isOpen={isOpen}>
            <AgentTierLabel>{selectedItem.label}</AgentTierLabel>
          </AgentTierToggle>
        )
      }
      onItemSelected={onDropdownChangeIgnoreNull((item) => {
        onItemSelected(item.value);
      })}
      css={css`
        margin: -6px 0;
      `}
    />
  );
});

const defaultParams: SearchParams = {
  page: 1,
  pageSize: LIST_LIMIT as PerPage,
  sortOrder: SortOrder.ASCEND,
  sortBy: AgentsSortBy.NAME,
  agentTypes: undefined,
  teamIds: undefined,
  connection: 'ALL',
  level: undefined,
  query: undefined,
};

export const AgentList: FC = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const { getErrorMessage } = useDeskErrorHandler();

  const {
    agentDetail: {
      data: { agent: selectedAgent },
      isFetching: isFetchingAgentDetail,
      setSelectedAgent,
      resetAgentDetail,
    },
  } = useContext(AdminContext);
  const currentAgent = useDeskAgent();
  const { activeDrawerID, openDrawer, closeDrawer } = useContext(DrawerContext);
  const { desk, pid, region } = useSelector((state: RootState) => {
    return {
      desk: state.desk,
      pid: state.desk.project.pid,
      region: state.applicationState.data?.region ?? '',
    };
  });

  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const {
    page,
    pageSize,
    teamIds,
    sortOrder,
    sortBy,
    connection,
    activationStatus,
    level,
    query: searchQuery,
    agentTypes,
    updateParams,
  } = useQueryString<SearchParams>(defaultParams);
  const selectedAgentGroupIds = useMemo(() => teamIds?.split(',').map((id) => Number(id)) ?? [], [teamIds]);
  const types = useMemo(() => agentTypes?.split(',') ?? [], [agentTypes]);

  const agentType = useMemo(() => {
    if (types.length === 0) return undefined;
    if (types.includes('bot')) {
      if (types.length === 1) return [AgentType.BOT];
      return [AgentType.USER, AgentType.BOT];
    }
    return [AgentType.USER];
  }, [types]);

  const role = useMemo(() => {
    if (!(types.includes('agent') && types.includes('admin'))) {
      if (types.includes('agent')) return AgentRole.AGENT;
      if (types.includes('admin')) return AgentRole.ADMIN;
    }
    return undefined;
  }, [types]);

  const fetchAgentsRequest = useCallback(
    async ({ limit, offset, sortBy, sortOrder, connection, group, tier, status, query }) => {
      setIsFetching(true);
      const sortByPrefix = sortOrder === SortOrder.DESCEND ? '-' : '';
      try {
        const {
          data: { count, results },
        } = await deskApi.fetchAgents(pid, region, {
          limit,
          offset,
          order: sortBy ? `${sortByPrefix}${sortBy}` : undefined,
          group,
          connection: connection === 'ALL' ? undefined : (connection as Agent['connection']),
          tier,
          status,
          query,
          agentType,
          role,
        });
        setAgents(results);
        setTotal(count);
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        logException(error);
      } finally {
        setIsFetching(false);
      }
    },
    [agentType, getErrorMessage, pid, region, role],
  );

  const updateAgent = useCallback((agent: Agent) => {
    setAgents((agents) => {
      const updateTargetIndex = agents.findIndex((currentAgent) => currentAgent.id === agent.id);
      if (updateTargetIndex >= 0) {
        return [...agents.slice(0, updateTargetIndex), agent, ...agents.slice(updateTargetIndex + 1)];
      }
      return agents;
    });
  }, []);

  const removeAgent = useCallback(
    (agent: Agent) => {
      const removeTargetIndex = agents.findIndex((currentAgent) => currentAgent.id === agent.id);
      if (removeTargetIndex >= 0) {
        setAgents([...agents.slice(0, removeTargetIndex), ...agents.slice(removeTargetIndex + 1)]);
      }
    },
    [agents],
  );

  const updateAgentConnection = useCallback(
    (agent: Agent, nextConnection: Agent['connection']) => {
      if (nextConnection === agent.connection || connection === 'ALL') {
        updateAgent(agent);
      } else {
        removeAgent(agent);
      }
    },
    [connection, removeAgent, updateAgent],
  );

  const updateDeskAgentActivation = useDeskAgentActivation({ onSuccess: updateAgent });

  const updateAgentConnectionRequest = useCallback(
    async ({
      agentId,
      connection,
      transferGroup,
    }: {
      agentId: Agent['id'];
      connection: Agent['connection'];
      transferGroup?: AgentGroup<'listItem'>;
    }) => {
      try {
        const { data } = await deskApi.updateAgentConnection(pid, region, {
          agentId,
          connection,
          transferGroupId: transferGroup?.id,
        });
        updateAgentConnection(data, data.connection);

        if (transferGroup) {
          toast.success({
            message: intl.formatMessage(
              { id: 'desk.agents.statusChange.transfer.success' },
              { teamName: transferGroup.name },
            ),
          });
        } else {
          toast.success({ message: intl.formatMessage({ id: 'desk.agents.statusChange.success' }) });
        }
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
      }
    },
    [getErrorMessage, intl, pid, region, updateAgentConnection],
  );

  const updateAgentTierRequest = async ({ agent, tier }: { agent: Agent; tier: Agent['tier'] }) => {
    const payload = new FormData();
    payload.append('tier', tier);
    try {
      const { data } = await deskApi.updateAgentProfile(pid, region, { agentId: agent.id, payload });
      updateAgent(data);
      toast.success({
        message: intl.formatMessage(
          {
            id: 'desk.agents.list.tier.update.success',
          },
          { tier },
        ),
      });
    } catch (e) {
      toast.error({ message: getErrorMessage(e) });
    }
  };

  useEffect(() => {
    if (activeDrawerID == null) {
      fetchAgentsRequest({
        offset: pageSize * (page - 1),
        limit: pageSize,
        sortBy,
        sortOrder,
        connection,
        group: selectedAgentGroupIds,
        tier: level,
        status: activationStatus || [
          AgentActivationStatusValue.ACTIVE,
          AgentActivationStatusValue.INACTIVE,
          AgentActivationStatusValue.PENDING,
          AgentActivationStatusValue.PAUSED,
        ],
        query: searchQuery,
      });
    }
  }, [
    activationStatus,
    activeDrawerID,
    connection,
    fetchAgentsRequest,
    level,
    page,
    pageSize,
    searchQuery,
    selectedAgentGroupIds,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    const agentEvents: ReadonlyArray<AgentEvent> = ['AGENT_CONNECTION'];
    const agentEventHandlers = {
      AGENT_CONNECTION: (deskEventPayload: Object) => {
        const { agent } = deskEventPayload as { agent: Agent | undefined };
        if (agent && agent.status !== 'INACTIVE') {
          updateAgent(agent);
        }
      },
    };

    if (window.dashboardSB) {
      const openChannelURL = desk.project.openChannelUrl;
      const channelHandler = new window.dashboardSB.ChannelHandler();
      const connectionHandler = new window.dashboardSB.ConnectionHandler();
      channelHandler.onMessageReceived = (channel, message) => {
        if (channel.isOpenChannel() && channel.url === openChannelURL) {
          try {
            const deskEvent: DeskEventPayload = JSON.parse((message as SendBird.UserMessage)['message']);
            if (agentEvents.includes(deskEvent.type as AgentEvent) || deskEvent.type.includes('AGENT')) {
              agentEventHandlers[deskEvent.type as keyof typeof agentEventHandlers]?.(deskEvent);
            }
          } catch (error) {
            logException({ error });
          }
        }
      };
      connectionHandler.onReconnectSucceeded = () => {
        fetchAgentsRequest({
          offset: pageSize * (page - 1),
          limit: pageSize,
          sortBy,
          sortOrder,
          connection,
          group: selectedAgentGroupIds,
          query: searchQuery,
        });
      };
      window.dashboardSB.addChannelHandler('AGENT_CHANNEL_HANDLER', channelHandler);
      window.dashboardSB.addConnectionHandler('AGENT_CONNECTION_HANDLER', connectionHandler);

      return () => {
        window.dashboardSB.removeChannelHandler('AGENT_CHANNEL_HANDLER');
        window.dashboardSB.removeChannelHandler('AGENT_CONNECTION_HANDLER');
      };
    }
  }, [
    connection,
    desk.project.openChannelUrl,
    fetchAgentsRequest,
    page,
    pageSize,
    sortBy,
    sortOrder,
    selectedAgentGroupIds,
    updateAgent,
    searchQuery,
  ]);

  const getDefaultSortOrder = (key: AgentsSortBy) => (key === sortBy ? sortOrder : undefined);

  const handleSortChange = useCallback(
    (sortColumn?: TableColumnProps<Agent>, sortOrder?: SortOrder) => {
      sortColumn && sortOrder && updateParams({ sortBy: sortColumn.key as AgentsSortBy, sortOrder });
    },
    [updateParams],
  );

  const handlePaginationChange = useCallback<ComponentProps<typeof Paginator>['onChange']>(
    (nextPage, nextPageSize) => {
      updateParams({ page: nextPage, pageSize: nextPageSize });
    },
    [updateParams],
  );

  const handleRowClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const { agentId } = e.currentTarget.dataset;

      if (agentDrawerID && typeof agentId === 'string' && selectedAgent?.id === parseInt(agentId, 10)) {
        closeDrawer();
        resetAgentDetail();
        return;
      }
      const agent = agentId ? agents.find((agent) => agent.id === parseInt(agentId, 10)) : null;

      if (!agent || isFetchingAgentDetail) {
        return;
      }

      openDrawer(agentDrawerID);
      setSelectedAgent(agent.id);
    },
    [agents, closeDrawer, isFetchingAgentDetail, openDrawer, selectedAgent, setSelectedAgent, resetAgentDetail],
  );

  const handleActionChange = useCallback(
    async (action, agent) => {
      const {
        data: { active },
      } = await fetchAgentTicketCounts(pid, region, { agentId: agent.id });

      if (active === 0 || action === AgentConnection.ONLINE || !desk.project.bulkTransferEnabled) {
        updateAgentConnectionRequest({ agentId: agent.id, connection: action });
        return;
      }

      showDialog({
        dialogTypes: DialogType.AgentConnectionStatusChange,
        dialogProps: {
          status: action,
          onSuccess: (group) => {
            updateAgentConnectionRequest({ agentId: agent.id, connection: action, transferGroup: group });
          },
        },
      });
    },
    [desk.project.bulkTransferEnabled, pid, region, showDialog, updateAgentConnectionRequest],
  );

  const handleAgentConnectionSelected = (agent: Agent): PropOf<typeof AgentConnectionDropdown, 'onItemSelected'> =>
    onDropdownChangeIgnoreNull((item) => {
      handleActionChange(item.value, agent);
    });

  const handleAgentTierSelected = (agent: Agent) => (tier: Agent['tier']) => {
    updateAgentTierRequest({ agent, tier });
  };

  const handleQuerySubmit = useCallback(
    (query) => {
      updateParams({ page: 1, pageSize: 20, query });
    },
    [updateParams],
  );

  const onRow: TableProps<Agent>['onRow'] = useCallback(
    (record) => {
      return {
        'data-agent-id': record.id,
        onClick: handleRowClick,
        style: {
          cursor: 'pointer',
        },
      };
    },
    [handleRowClick],
  );

  const getItems: (agent: Agent) => OverflowMenuProps['items'] = useCallback(
    (agent) => {
      const pendingToActivate = {
        label: intl.formatMessage({
          id: 'desk.agents.list.td.actions.pendingToActive',
        }),
        onClick: () => {
          updateDeskAgentActivation(agent, AgentActivationStatusValue.ACTIVE);
        },
        disabled:
          agent.id === desk.agent.id ||
          (agent.agentType === AgentType.BOT && agent.bot != null && !agent.bot.isReadyToActivate),
      };
      const activate = {
        label: intl.formatMessage({
          id: 'desk.agents.list.td.actions.inactiveToActive',
        }),
        onClick: () => {
          updateDeskAgentActivation(agent, AgentActivationStatusValue.ACTIVE);
        },
        disabled: agent.id === desk.agent.id,
      };
      const deactivate = {
        label: intl.formatMessage({
          id: 'desk.agents.list.td.actions.activeToInactive',
        }),
        onClick: () => {
          updateDeskAgentActivation(agent, AgentActivationStatusValue.INACTIVE);
        },
        disabled: agent.id === desk.agent.id,
      };
      const pause = {
        label: intl.formatMessage({
          id: 'desk.agents.list.td.actions.pause',
        }),
        onClick: () => {
          updateDeskAgentActivation(agent, AgentActivationStatusValue.PAUSED);
        },
        disabled: agent.id === desk.agent.id,
      };

      switch (agent.status) {
        case AgentActivationStatusValue.PENDING:
          return [pendingToActivate];
        case AgentActivationStatusValue.INACTIVE:
          return [pause, activate];
        case AgentActivationStatusValue.PAUSED:
          return [activate, deactivate];
        case AgentActivationStatusValue.ACTIVE:
          return [pause, deactivate];
        default:
          return [deactivate];
      }
    },
    [desk.agent.id, intl, updateDeskAgentActivation],
  );

  const rowActions: TableProps<Agent>['rowActions'] = (record: Agent) => {
    return [<OverflowMenu key="agentActivationActions" items={getItems(record)} stopClickEventPropagation={true} />];
  };

  const rowStyles: PropOf<typeof AgentListTable, 'rowStyles'> = (_, index) => {
    const selectedIndex = selectedAgent ? agents.findIndex((agent) => agent.id === selectedAgent.id) : undefined;
    if (index === selectedIndex) {
      return css`
        background: ${cssVariables('neutral-1')};
      `;
    }
  };

  const agentStatus = {
    ONLINE: intl.formatMessage({ id: 'desk.agents.status.online' }),
    AWAY: intl.formatMessage({ id: 'desk.agents.status.away' }),
    OFFLINE: intl.formatMessage({ id: 'desk.agents.status.offline' }),
  };

  return (
    <StyledAgentList isDetailOpen={activeDrawerID === agentDrawerID}>
      <PageHeader>
        <PageHeader.Title>{intl.formatMessage({ id: 'desk.agents.list.title' })}</PageHeader.Title>
        <PageHeader.Actions>
          <BasicSearchBar
            name="query"
            defaultValue={searchQuery}
            placeholder={intl.formatMessage({ id: 'desk.agents.search.placeholder' })}
            width={240}
            disabled={isFetching}
            onSubmit={handleQuerySubmit}
          />
        </PageHeader.Actions>
      </PageHeader>
      <AgentListFilters
        updateParams={updateParams}
        agentTypes={agentTypes}
        teamIds={teamIds}
        connection={connection}
        level={level}
        activationStatus={activationStatus}
        isFetching={isFetching}
      />
      <AgentListTable
        rowKey="id"
        dataSource={agents}
        loading={isFetching}
        showScrollbars={true}
        columns={[
          {
            key: AgentsSortBy.NAME,
            dataIndex: 'name',
            title: intl.formatMessage({ id: 'desk.agents.list.th.name' }),
            flex: 3,
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(AgentsSortBy.NAME),
            render: (agent) => {
              /**
               * FIXME:
               * Remove this email tweak when Desk back-end team fixes email sync delay issue.
               * https://sendbird.atlassian.net/browse/DESK-259
               */
              const latestAgentEmail = agent.id === currentAgent.id ? currentAgent.email : agent.email;
              return <AgentItem agent={{ ...agent, email: latestAgentEmail }} query={searchQuery} />;
            },
          },
          {
            key: AgentsSortBy.SENDBIRD_ID,
            dataIndex: 'sendbirdId',
            title: intl.formatMessage({ id: 'desk.agents.list.th.id' }),
            flex: 3,
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(AgentsSortBy.SENDBIRD_ID),
            render: ({ sendbirdId }) => (
              <>
                <TextWithOverflowTooltip tooltipDisplay="inline-block">{sendbirdId}</TextWithOverflowTooltip>
                <CopySendbirdIDButton size="xsmall" buttonType="secondary" copyableText={sendbirdId} />
              </>
            ),
          },
          {
            key: AgentsSortBy.GROUP_COUNT,
            dataIndex: 'groups',
            title: intl.formatMessage({ id: 'desk.agents.list.th.teams' }),
            flex: 1,
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(AgentsSortBy.GROUP_COUNT),
            render: ({ groups }) => {
              const agentGroupCountText = (
                <span>
                  {intl.formatMessage({ id: 'desk.agents.list.td.teams' }, { agentGroupCount: groups.length })}
                </span>
              );

              if (groups.length > 0) {
                return (
                  <Tooltip
                    content={intl.formatMessage(
                      { id: 'desk.agents.list.td.teams.tooltip' },
                      {
                        agentGroupNames: groups
                          .map((group) => group.name)
                          .slice(0, 10)
                          .join(', '),
                        moreNameCount: groups.slice(10).length,
                      },
                    )}
                  >
                    {agentGroupCountText}
                  </Tooltip>
                );
              }
              return agentGroupCountText;
            },
          },
          {
            key: AgentsSortBy.TIER,
            dataIndex: 'tier',
            title: intl.formatMessage({ id: 'desk.agents.list.th.tier' }),
            width: 130,
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(AgentsSortBy.TIER),
            onCell: () => ({
              onClick: (event) => {
                event.stopPropagation();
              },
            }),
            render: (agent) =>
              agent.role === 'AGENT' && agent.agentType === AgentType.USER ? (
                <AgentTierDropdown tier={agent.tier} onItemSelected={handleAgentTierSelected(agent)} />
              ) : (
                EMPTY_TEXT
              ),
          },
          {
            key: AgentsSortBy.CONNECTION,
            dataIndex: 'connection',
            title: intl.formatMessage({ id: 'desk.agents.list.th.connectionStatus' }),
            flex: 1.5,
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(AgentsSortBy.CONNECTION),
            onCell: () => ({
              onClick: (event) => {
                event.stopPropagation();
              },
            }),
            render: (agent) => (
              <AgentConnectionDropdown
                positionFixed={true}
                placement="bottom-start"
                variant="inline"
                size="small"
                toggleRenderer={() => (
                  <AgentAction>
                    <AgentActionLabel connection={agent.connection} />
                    <AgentActionText>{agentStatus[agent.connection]}</AgentActionText>
                  </AgentAction>
                )}
                selectedItem={
                  {
                    label: startCase(agent.connection.toLowerCase()),
                    value: agent.connection,
                  } as AgentConnectionDropdownItem
                }
                items={[
                  { label: intl.formatMessage({ id: 'desk.agents.status.online' }), value: AgentConnection.ONLINE },
                  ...(agent.agentType === AgentType.BOT
                    ? []
                    : [{ label: intl.formatMessage({ id: 'desk.agents.status.away' }), value: AgentConnection.AWAY }]),
                  { label: intl.formatMessage({ id: 'desk.agents.status.offline' }), value: AgentConnection.OFFLINE },
                ]}
                itemToString={(item) => item.value}
                itemToElement={(item) => {
                  return (
                    <AgentActionItem>
                      <AgentActionLabel connection={item.value} />
                      {item.label}
                    </AgentActionItem>
                  );
                }}
                showArrow={true}
                onItemSelected={handleAgentConnectionSelected(agent)}
                disabled={agent.status !== AgentActivationStatusValue.ACTIVE}
              />
            ),
          },
          {
            key: AgentsSortBy.CONNECTION_UPDATED_AT,
            dataIndex: 'connectionUpdatedTs',
            title: intl.formatMessage({ id: 'desk.agents.list.th.statusDuration' }),
            flex: 2,
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(AgentsSortBy.CONNECTION_UPDATED_AT),
            render: (agent) => (
              <AgentItemDuration timestamp={agent.connectionUpdatedTs} connection={agent.connection} />
            ),
          },
          {
            key: AgentsSortBy.ACTIVATION_STATUS,
            dataIndex: 'status',
            title: (
              <TableHeadStatusContainer>
                <TableHeadStatusText>
                  {intl.formatMessage({ id: 'desk.team.form.selectedAgents.th.status' })}
                </TableHeadStatusText>
                <AgentActivationContextualHelp
                  placement="bottom-end"
                  popperProps={{
                    modifiers: {
                      offset: {
                        offset: '20, 4',
                      },
                    },
                  }}
                >
                  <TableHeadStatusInfoIcon icon="info" />
                </AgentActivationContextualHelp>
              </TableHeadStatusContainer>
            ),
            flex: 2,
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(AgentsSortBy.ACTIVATION_STATUS),
            render: (agent) => <AgentActivationStatus status={agent.status} />,
          },
        ]}
        onRow={onRow}
        rowActions={rowActions}
        rowStyles={rowStyles}
        onSortByUpdated={handleSortChange}
        emptyView={
          <CenteredEmptyState
            icon="no-search"
            title={intl.formatMessage({
              id: 'desk.agents.list.noResult.header',
            })}
            description={
              searchQuery
                ? intl.formatMessage(
                    {
                      id: 'desk.agents.list.noResult.query.desc',
                    },
                    { query: searchQuery },
                  )
                : intl.formatMessage({
                    id: 'desk.agents.list.noResult.filter.desc',
                  })
            }
          />
        }
        footer={
          <AgentListPaginator
            current={page}
            total={total}
            pageSize={pageSize as PerPage}
            pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS as ReadonlyArray<PerPage>}
            onChange={handlePaginationChange}
            onItemsPerPageChange={handlePaginationChange}
          />
        }
      />
    </StyledAgentList>
  );
};
