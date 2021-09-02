import { memo, useState, useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { TreeSelect, TreeData, toast, cssVariables, Subtitles, Icon } from 'feather';

import { deskApi } from '@api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { PropOf, PropsOf } from '@utils';

const AllAgentGroupsText = styled.span`
  display: flex;
  align-items: center;
  padding-left: 8px;
  height: 30px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};
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

type TreeSelectProp<T extends keyof PropsOf<typeof TreeSelect>> = PropOf<typeof TreeSelect, T>;

type Props = {
  selectedAgentGroupIds: AgentGroup['id'][];
  width?: TreeSelectProp<'width'>;
  disabled?: boolean;
  onSelect: (selectedGroups: TreeData[]) => void;
};

export const AgentGroupsTreeSelect = memo<Props>(({ selectedAgentGroupIds, width, disabled, onSelect }) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [agentGroups, setAgentGroups] = useState<AgentGroup<'listItem'>[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isAllAgentGroupsSelected, setIsAllAgentGroupsSelected] = useState(false);

  const fetchAgentGroupsRequest = useCallback(async () => {
    setIsFetching(true);
    try {
      const {
        data: { results },
      } = await deskApi.fetchAgentGroups(pid, region, { offset: 0, limit: 100 });
      setAgentGroups(results);
    } catch (e) {
      toast.error({ message: getErrorMessage(e) });
    } finally {
      setIsFetching(false);
    }
  }, [getErrorMessage, pid, region]);

  useEffect(() => {
    fetchAgentGroupsRequest();
  }, [fetchAgentGroupsRequest]);

  useEffect(() => {
    if (selectedAgentGroupIds.length === 0 || agentGroups.length === selectedAgentGroupIds.length) {
      setIsAllAgentGroupsSelected(true);
    }
  }, [agentGroups.length, selectedAgentGroupIds.length]);

  const renderToggleContent = () => (
    <AllAgentGroupsText>{intl.formatMessage({ id: 'desk.agents.filter.agentGroups.all' })}</AllAgentGroupsText>
  );

  const handlePrefixItemClick = () => {
    if (isAllAgentGroupsSelected) {
      onSelect([{ value: agentGroups[0].id.toString(), label: agentGroups[0].name }]);
      setIsAllAgentGroupsSelected(false);
      return;
    }
    onSelect([]);
    setIsAllAgentGroupsSelected(true);
  };

  const handleGroupSelect = useCallback(
    (selectedNodes: TreeData[], isAllNodesSelected: boolean) => {
      if (selectedNodes.length === 0 || isAllNodesSelected) {
        onSelect([]);
      } else {
        onSelect(selectedNodes);
      }
      setIsAllAgentGroupsSelected(isAllNodesSelected);
    },
    [onSelect],
  );

  const treeData = agentGroups.map((group) => ({ value: group.id.toString(), label: group.name }));
  const selectedNodes = treeData.filter((data) => selectedAgentGroupIds.includes(Number(data.value)));

  return (
    <TreeSelect
      treeData={treeData}
      selectedNodes={selectedNodes.length > 0 ? selectedNodes : treeData}
      width={width}
      disabled={isFetching || disabled}
      prefixItem={
        <PrefixItem isChecked={isAllAgentGroupsSelected} onClick={handlePrefixItemClick}>
          {intl.formatMessage({ id: 'desk.agents.filter.agentGroups.all' })}
          {isAllAgentGroupsSelected && <Icon icon="done" size={20} color={cssVariables('purple-7')} />}
        </PrefixItem>
      }
      toggleRenderer={selectedAgentGroupIds.length === 0 ? renderToggleContent : undefined}
      onSelect={handleGroupSelect}
    />
  );
});
