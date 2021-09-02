import { memo, useMemo, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Dropdown, TreeSelect, TreeData, DropdownProps, cssVariables, Subtitles, Icon } from 'feather';

import { AgentConnection, AgentTier, AgentActivationStatusValue } from '@constants';
import { QueryParamsWithUpdate } from '@hooks/useQueryString';
import { onDropdownChangeIgnoreNull } from '@utils';

import { AgentGroupsTreeSelect } from '../AgentGroupsTreeSelect';
import { SearchParams } from './agentList';

type FilterOption<T> = { labelKey: string; value: T };

const AgentFilters = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 26px;
`;

const AllAgentTypesText = styled.span`
  display: flex;
  align-items: center;
  padding-left: 8px;
  height: 30px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};
`;

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background: ${cssVariables('neutral-3')};
  margin: 0 8px;
`;

const PrefixItem = styled.div<{ isChecked: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 14px 16px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  color: ${({ isChecked }) => (isChecked ? cssVariables('purple-7') : cssVariables('neutral-10'))};
  cursor: pointer;
  ${Subtitles['subtitle-01']}
  white-space: nowrap;
`;

const statusFilterItems: { labelKey: string; value: AgentConnection | 'ALL' }[] = [
  {
    labelKey: 'desk.agents.filter.status.all',
    value: 'ALL',
  },
  {
    labelKey: 'desk.agents.filter.status.online',
    value: AgentConnection.ONLINE,
  },
  {
    labelKey: 'desk.agents.filter.status.away',
    value: AgentConnection.AWAY,
  },
  {
    labelKey: 'desk.agents.filter.status.offline',
    value: AgentConnection.OFFLINE,
  },
];

const agentTierLabelIntlKeys: Record<AgentTier, string> = {
  [AgentTier.INTERMEDIATE]: 'desk.agent.tier.intermediate',
  [AgentTier.EXPERT]: 'desk.agent.tier.expert',
};

const agentTierItems = [
  {
    labelKey: 'desk.agents.list.tier.all',
    value: undefined,
  },
  {
    labelKey: agentTierLabelIntlKeys.INTERMEDIATE,
    value: AgentTier.INTERMEDIATE,
  },
  {
    labelKey: agentTierLabelIntlKeys.EXPERT,
    value: AgentTier.EXPERT,
  },
];

const activationStatusFilterItems = [
  {
    labelKey: 'desk.agents.filter.activationStatus.all',
    value: undefined,
  },
  {
    labelKey: 'desk.agents.filter.activationStatus.active',
    value: AgentActivationStatusValue.ACTIVE,
  },
  {
    labelKey: 'desk.agents.filter.activationStatus.inactive',
    value: AgentActivationStatusValue.INACTIVE,
  },
  {
    labelKey: 'desk.agents.filter.activationStatus.pending',
    value: AgentActivationStatusValue.PENDING,
  },
  {
    labelKey: 'desk.agents.filter.activationStatus.paused',
    value: AgentActivationStatusValue.PAUSED,
  },
];

type AgentTierFilterOption = FilterOption<AgentTier> | FilterOption<undefined>; // value = undefined: Show all levels
type AgentActivationStatusFilterOption = FilterOption<AgentActivationStatusValue> | FilterOption<undefined>; // value = undefined: Show all levels

type Props = {
  updateParams: QueryParamsWithUpdate<SearchParams>['updateParams'];
  isFetching: boolean;
  level: SearchParams['level'];
  connection: SearchParams['connection'];
  teamIds: SearchParams['teamIds'];
  activationStatus: SearchParams['activationStatus'];
  agentTypes: SearchParams['agentTypes'];
};

enum AgentRoleAndType {
  ALL = 'all',
  ADMIN = 'admin',
  AGENT = 'agent',
  BOT = 'bot',
}

type AgentRoleAngTypeItem = {
  value: AgentRoleAndType;
  labelKey: string;
};

const agentTypeItems: AgentRoleAngTypeItem[] = [
  {
    value: AgentRoleAndType.ADMIN,
    labelKey: 'desk.agents.filter.agentType.admin',
  },
  {
    value: AgentRoleAndType.AGENT,
    labelKey: 'desk.agents.filter.agentType.agent',
  },
  {
    value: AgentRoleAndType.BOT,
    labelKey: 'desk.agents.filter.agentType.bot',
  },
];

type AgentTypeSelectProps = {
  selectedTypes: AgentRoleAndType[];
  width?: number;
  disabled: boolean;
  onSelect: (selectedGroups: TreeData[]) => void;
};

const AgentTypeSelect = memo<AgentTypeSelectProps>(({ disabled, onSelect, selectedTypes }) => {
  const intl = useIntl();
  const [isAllAgentTypesSelected, setIsAllAgentTypesSelected] = useState(false);
  const treeData = agentTypeItems.map((item) => ({
    value: item.value,
    label: intl.formatMessage({ id: item.labelKey }),
  }));

  const prefixItem = useMemo(
    () => ({
      value: AgentRoleAndType.ALL,
      label: intl.formatMessage({ id: 'desk.agents.filter.agentType.all' }),
    }),
    [intl],
  );

  const handlePrefixItemClick = useCallback(() => {
    if (isAllAgentTypesSelected) {
      onSelect([prefixItem]);
      setIsAllAgentTypesSelected(false);
      return;
    }
    onSelect([]);
    setIsAllAgentTypesSelected(true);
  }, [isAllAgentTypesSelected, onSelect, prefixItem]);

  const handleItemSelect = useCallback(
    (selectedNodes: TreeData[], isAllNodesSelected: boolean) => {
      if (selectedNodes.length === 0 || isAllNodesSelected) {
        onSelect([]);
      } else {
        onSelect(selectedNodes);
      }
      setIsAllAgentTypesSelected(isAllNodesSelected);
    },
    [onSelect],
  );

  const renderToggleContent = () => (
    <AllAgentTypesText>{intl.formatMessage({ id: 'desk.agents.filter.agentType.all' })}</AllAgentTypesText>
  );

  const selectedNodes = treeData.filter((data) => selectedTypes.includes(data.value));

  return (
    <TreeSelect
      treeData={treeData}
      selectedNodes={selectedNodes.length > 0 ? selectedNodes : treeData}
      disabled={disabled}
      prefixItem={
        <PrefixItem isChecked={isAllAgentTypesSelected} onClick={handlePrefixItemClick}>
          {prefixItem.label}
          {isAllAgentTypesSelected && <Icon icon="done" size={20} color={cssVariables('purple-7')} />}
        </PrefixItem>
      }
      toggleRenderer={selectedTypes.length === 0 ? renderToggleContent : undefined}
      onSelect={handleItemSelect}
    />
  );
});

export const AgentListFilters = memo<Props>(
  ({ updateParams, teamIds, connection, isFetching, level, activationStatus, agentTypes }) => {
    const intl = useIntl();
    const selectedAgentGroupIds = useMemo(() => teamIds?.split(',').map((id) => Number(id)) ?? [], [teamIds]);
    const selectedAgentTypes = useMemo(() => (agentTypes?.split(',') as AgentRoleAndType[]) ?? [], [agentTypes]);

    const handleAgentTypesItemSelected = useCallback(
      (selectedAgentTypes: TreeData[]) => {
        const agentTypes = selectedAgentTypes.map((type) => type.value).join(',');
        updateParams({ page: 1, pageSize: 20, agentTypes });
      },
      [updateParams],
    );

    const handleAgentStatusFilterItemSelected: DropdownProps<
      FilterOption<AgentConnection>
    >['onItemSelected'] = onDropdownChangeIgnoreNull((item) => {
      updateParams({ page: 1, pageSize: 20, connection: item.value });
    });

    const handleAgentGroupFilterItemSelected = useCallback(
      (selectedAgentGroups: TreeData[]) => {
        const selectedAgentGroupIds = selectedAgentGroups.map((agentGroups) => agentGroups.value).join(',');
        updateParams({ page: 1, pageSize: 20, teamIds: selectedAgentGroupIds });
      },
      [updateParams],
    );

    const handleAgentTierFilterItemSelected: DropdownProps<AgentTierFilterOption>['onItemSelected'] = onDropdownChangeIgnoreNull(
      (item) => {
        updateParams({ page: 1, pageSize: 20, level: item.value });
      },
    );

    const handleAgentActivationStatusFilterItemSelected: DropdownProps<AgentActivationStatusFilterOption>['onItemSelected'] = onDropdownChangeIgnoreNull(
      (item) => {
        updateParams({ page: 1, pageSize: 20, activationStatus: item.value });
      },
    );

    return (
      <AgentFilters data-test-id="AgentListFilters">
        <AgentTypeSelect
          selectedTypes={selectedAgentTypes}
          width={selectedAgentTypes.length > 2 ? 300 : undefined}
          disabled={isFetching}
          onSelect={handleAgentTypesItemSelected}
        />
        <Divider />
        <Dropdown<FilterOption<AgentConnection | 'ALL'>>
          size="small"
          items={statusFilterItems}
          itemToString={(item) => intl.formatMessage({ id: item.labelKey })}
          selectedItem={statusFilterItems.find((item) => item.value === connection)}
          disabled={isFetching}
          onItemSelected={handleAgentStatusFilterItemSelected}
          css={css`
            margin-right: 4px;
          `}
        />
        <AgentGroupsTreeSelect
          selectedAgentGroupIds={selectedAgentGroupIds}
          width={selectedAgentGroupIds.length > 2 ? 300 : undefined}
          disabled={isFetching}
          onSelect={handleAgentGroupFilterItemSelected}
        />
        <Dropdown<AgentTierFilterOption>
          size="small"
          items={agentTierItems}
          itemToString={(item) => intl.formatMessage({ id: item.labelKey })}
          selectedItem={agentTierItems.find((item) => item.value === level)}
          disabled={isFetching}
          onItemSelected={handleAgentTierFilterItemSelected}
          css={css`
            margin-left: 4px;
          `}
        />
        <Dropdown<AgentActivationStatusFilterOption>
          size="small"
          items={activationStatusFilterItems}
          itemToString={(item) => intl.formatMessage({ id: item.labelKey })}
          selectedItem={activationStatusFilterItems.find((item) => item.value === activationStatus)}
          disabled={isFetching}
          onItemSelected={handleAgentActivationStatusFilterItemSelected}
          css={css`
            margin-left: 4px;
          `}
        />
      </AgentFilters>
    );
  },
);
