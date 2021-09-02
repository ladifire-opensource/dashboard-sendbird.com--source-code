import React, { useRef } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  OverflowMenu,
  OverflowMenuProps,
  Table,
  Toggle,
  Tooltip,
  cssVariables,
  TooltipTargetIcon,
  ContextualHelp,
  TooltipRef,
  TooltipTrigger,
  TooltipVariant,
} from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { AgentActivationStatusValue, AgentType } from '@constants';
import { useShowDialog } from '@hooks';
import { AgentActivationContextualHelp, AgentActivationStatus, AgentItem } from '@ui/components';

const ContextualHelpTooltipContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ContextualHelpTooltip = styled(ContextualHelp)`
  display: inline-block;
  height: 24px;
`;

const AutoRoutingEnabledTooltipText = styled.span`
  display: inline-block;
  flex: 1;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  text-align: left;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-7')};
`;

const TableContainer = styled.div<{ isEmpty: boolean }>`
  ${({ isEmpty }) =>
    isEmpty &&
    css`
      tbody {
        border-bottom: 0;
      }
    `};
`;

const EmptyContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const EmptyText = styled.span`
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-3')};
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

const ToggleWrapper = styled.div`
  display: flex;
  height: 20px;
`;

const AutoRoutingEnabledToggle = styled(Toggle)`
  :disabled {
    pointer-events: none;
  }
`;

type Props = {
  selectedAgents: AgentGroupMember[];
  isFetching: boolean;
  updateSelectedAgentStatus: (params: {
    id: Agent['id'];
    status: AgentActivationStatusValue;
    autoRoutingEnabled: AgentGroupMember['autoRoutingEnabled'];
  }) => void;
  handleRemoveSelectedAgentClick: (index: number) => () => void;
  handleAutoRoutingEnabledClick: (index: number) => () => void;
};

export const SelectedAgentsTable = React.memo<Props>(
  ({
    selectedAgents,
    isFetching,
    updateSelectedAgentStatus,
    handleAutoRoutingEnabledClick,
    handleRemoveSelectedAgentClick,
  }) => {
    const intl = useIntl();
    const showDialog = useShowDialog();

    const toggleTooltipRefs = useRef<Record<number, TooltipRef | null>>({});

    const handleAddPendingAgentClick = ({ id, status }: AgentGroupMember) => {
      if (status === AgentActivationStatusValue.PENDING) {
        showDialog({
          dialogTypes: DialogType.AgentActivationStatusChange,
          dialogProps: {
            agentId: id,
            fromStatus: AgentActivationStatusValue.PENDING,
            toStatus: AgentActivationStatusValue.ACTIVE,
            onSuccess: (agent) =>
              updateSelectedAgentStatus({
                id: agent.id,
                status: agent.status,
                autoRoutingEnabled: agent.role !== 'ADMIN' && agent.agentType !== AgentType.BOT,
              }),
          },
        });
      }
    };

    const toggleTooltipRefCallback = (id: number) => (ref: TooltipRef | null) => {
      toggleTooltipRefs.current[id] = ref;
    };

    const handleToggleMouseEnter: (id: number) => React.MouseEventHandler<HTMLDivElement> = (id) => (event) => {
      event.stopPropagation();
      toggleTooltipRefs.current[id]?.show();
    };

    const handleToggleMouseLeave: (id: number) => React.MouseEventHandler<HTMLDivElement> = (id) => (event) => {
      event.stopPropagation();
      toggleTooltipRefs.current[id]?.hide();
    };

    const getRowActions = (agentGroupMember: AgentGroupMember, index: number) => {
      const actions: OverflowMenuProps['items'] = [];
      if (agentGroupMember.status === AgentActivationStatusValue.PENDING) {
        const disabled = agentGroupMember.agentType === AgentType.BOT && !agentGroupMember.isReadyToActivate;
        actions.push({
          label: intl.formatMessage({
            id: 'desk.team.form.selectedAgents.actions.addPendingAgent',
          }),
          disabled,
          tooltip: disabled
            ? {
                content: (
                  <div
                    css={css`
                      width: 200px;
                    `}
                  >
                    {intl.formatMessage({
                      id: 'desk.team.form.selectedAgents.actions.addPendingAgent.disabled.tooltipContent',
                    })}
                  </div>
                ),
                placement: 'top',
                popperProps: { positionFixed: true },
              }
            : undefined,
          onClick: () => {
            handleAddPendingAgentClick(agentGroupMember);
          },
        });
      }

      actions.push({
        label: intl.formatMessage({
          id: 'desk.team.form.selectedAgents.actions.removeAgent',
        }),
        onClick: handleRemoveSelectedAgentClick(index),
      });

      return actions;
    };

    return (
      <TableContainer isEmpty={selectedAgents.length === 0} data-test-id="SelectedAgentsTableContainer">
        <Table<AgentGroupMember>
          rowKey="id"
          dataSource={selectedAgents}
          loading={isFetching}
          columns={[
            {
              key: 'agent',
              title: intl.formatMessage({ id: 'desk.team.form.selectedAgents.th.agent' }),
              flex: 2.25,
              render: (agent) => <AgentItem agent={agent} />,
            },
            {
              key: 'route',
              title: (
                <ContextualHelpTooltipContainer data-test-id="AutoRoutingEnabledTooltip">
                  {intl.formatMessage({ id: 'desk.team.form.selectedAgents.th.autoRoutingEnabled' })}
                  <ContextualHelpTooltip
                    content={
                      <AutoRoutingEnabledTooltipText>
                        {intl.formatMessage({ id: 'desk.team.form.selectedAgents.th.autoRoutingEnabled.tooltip' })}
                      </AutoRoutingEnabledTooltipText>
                    }
                    tooltipContentStyle={css`
                      width: 296px;
                      word-break: break-word;
                    `}
                  >
                    <TooltipTargetIcon icon="info" />
                  </ContextualHelpTooltip>
                </ContextualHelpTooltipContainer>
              ),
              flex: 1,
              render: ({ id, status, autoRoutingEnabled, agentType }, index) => {
                if (agentType === AgentType.BOT) {
                  return (
                    <Tooltip
                      trigger={TooltipTrigger.Manual}
                      ref={toggleTooltipRefCallback(id)}
                      placement="top"
                      portalId="portal_popup"
                      content={intl.formatMessage({ id: 'desk.team.form.selectedAgents.status.bot.tooltip' })}
                      variant={TooltipVariant.Dark}
                    >
                      <ToggleWrapper
                        onMouseEnter={handleToggleMouseEnter(id)}
                        onMouseLeave={handleToggleMouseLeave(id)}
                      >
                        <Toggle
                          checked={autoRoutingEnabled}
                          disabled={true}
                          css={css`
                            cursor: not-allowed;
                            pointer-events: none;
                          `}
                        />
                      </ToggleWrapper>
                    </Tooltip>
                  );
                }
                if (status === AgentActivationStatusValue.PENDING) {
                  return (
                    <Tooltip
                      trigger={TooltipTrigger.Manual}
                      ref={toggleTooltipRefCallback(id)}
                      placement="top"
                      variant={TooltipVariant.Dark}
                      portalId="portal_popup"
                      content={intl.formatMessage({ id: 'desk.team.form.selectedAgents.status.pending.tooltip' })}
                      css={css`
                        line-height: 0;
                      `}
                    >
                      <ToggleWrapper
                        onMouseEnter={handleToggleMouseEnter(id)}
                        /**
                         * React bug
                         * If your HTML element contains disabled element, onMouseLeave won't be triggered event though native mouseLeave event works fine.
                         * onMouseOut is alternative solution for this case.
                         *
                         * Solution #1
                         * - use onMouseOut on disabled element.
                         * - DO NOT USE onMouseOut on wrapper of disabled element. Its behavior is not consistent.
                         *
                         * Solution #2
                         * - add css, { pointer-event: none} for disabled element
                         */
                        onMouseLeave={handleToggleMouseLeave(id)}
                      >
                        <AutoRoutingEnabledToggle
                          checked={autoRoutingEnabled}
                          disabled={true}
                          css={css`
                            cursor: not-allowed;
                            pointer-events: none;
                          `}
                        />
                      </ToggleWrapper>
                    </Tooltip>
                  );
                }
                return <Toggle checked={autoRoutingEnabled} onClick={handleAutoRoutingEnabledClick(index)} />;
              },
            },
            {
              key: 'status',
              title: (
                <TableHeadStatusContainer>
                  <TableHeadStatusText>
                    {intl.formatMessage({ id: 'desk.team.form.selectedAgents.th.status' })}
                  </TableHeadStatusText>
                  <AgentActivationContextualHelp wrapperHeight={24}>
                    <TableHeadStatusInfoIcon icon="info" />
                  </AgentActivationContextualHelp>
                </TableHeadStatusContainer>
              ),
              flex: 1,
              render: ({ status }) => <AgentActivationStatus status={status} />,
            },
            {
              key: 'actions',
              width: '32px',
              render: (agentGroupMember, index) => (
                <OverflowMenu
                  key="viewsTicketActions"
                  items={getRowActions(agentGroupMember, index)}
                  iconButtonProps={{ buttonType: 'tertiary' }}
                  stopClickEventPropagation={true}
                  popperProps={{
                    placement: 'bottom-end',
                    positionFixed: true,
                  }}
                />
              ),
            },
          ]}
          emptyView={
            <EmptyContainer>
              <EmptyText>{intl.formatMessage({ id: 'desk.team.form.selectedAgents.empty.noAgent' })}</EmptyText>
            </EmptyContainer>
          }
        />
      </TableContainer>
    );
  },
);
