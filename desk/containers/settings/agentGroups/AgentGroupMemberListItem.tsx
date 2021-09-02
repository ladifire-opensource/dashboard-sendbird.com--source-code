import { forwardRef } from 'react';

import styled from 'styled-components';

import { ControllerStateAndHelpers } from 'downshift';
import { cssVariables } from 'feather';

import { AgentItem } from '@ui/components';
import { transitionDefault } from '@ui/styles';

interface AgentSelectedStyleProps {
  $isSelected: boolean;
  $isHighlighted: boolean;
}

type DownshiftHelpers = ControllerStateAndHelpers<AgentGroupMember>;

type Props = {
  agentGroupMember: AgentGroupMember;
  query: string;
  isItemSelected: boolean;
  isHighlighted?: boolean;
  index: number;
  downshiftHelpers: Pick<DownshiftHelpers, 'getItemProps' | 'selectItemAtIndex' | 'setHighlightedIndex'>;
};

const Item = styled.li<AgentSelectedStyleProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 6px 16px;
  cursor: pointer;
  background: ${({ $isHighlighted }) => ($isHighlighted ? cssVariables('neutral-1') : 'white')};
  opacity: ${({ $isSelected }) => ($isSelected ? 0 : 1)};
  transform: translateX(${({ $isSelected }) => ($isSelected ? '50px' : 0)});
  transition: background 0.3s ${transitionDefault}, opacity 0.3s ${transitionDefault},
    transform 0.3s ${transitionDefault};

  & + & {
    margin-top: 1px;
  }

  &:hover {
    background: ${cssVariables('neutral-1')};
  }
`;

const AgentInfoItem = styled(AgentItem)`
  width: calc(100% - 84px);
`;

export const AgentGroupMemberListItem = forwardRef<HTMLLIElement, Props>(
  ({ agentGroupMember, query, isItemSelected, isHighlighted, index, downshiftHelpers }, ref) => {
    const { getItemProps } = downshiftHelpers;

    return (
      <Item
        ref={ref}
        {...getItemProps({
          key: agentGroupMember.id,
          item: agentGroupMember,
          index,
        })}
        $isSelected={isItemSelected}
        $isHighlighted={!!isHighlighted}
      >
        <AgentInfoItem agent={agentGroupMember} query={query} shouldShowActivationStatus={true} />
      </Item>
    );
  },
);
