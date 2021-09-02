import React from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { AgentGroupsSearchDropdown } from '../agentGroupsSearchDropdown';
import { AgentsSearchDropdown } from '../agentsSearchDropdown';

type Props = {
  ticket: Ticket;
  isAdmin: boolean;
  isAgent: boolean;
  isFetching: boolean;
  transferEnabled: boolean;
  handleActionChange: (payload: {
    action: TicketHeaderActionType;
    agent?: Agent;
    group?: AgentGroup<'listItem'>;
  }) => void;
};

const Container = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 8px;
`;

export const TicketHeaderTransferActions: React.FC<Props> = React.memo(
  ({ ticket, isAdmin, isAgent, transferEnabled, handleActionChange }) => {
    const intl = useIntl();
    const agentSearchAction =
      ticket.recentAssignment && (isAdmin || (isAgent && transferEnabled)) ? 'TRANSFER_TO_AGENT' : 'ASSIGN_TO_AGENT';
    const notPermittedToTransfer = !isAdmin && !transferEnabled;

    const handleGroupItemSelected = (group: AgentGroup<'listItem'>) => {
      if (ticket.group?.id !== group.id) {
        handleActionChange({ action: 'TRANSFER_TO_GROUP', group });
      }
    };

    const handleAgentItemSelected = (agent: Agent) => {
      handleActionChange({ action: agentSearchAction, agent });
    };

    return (
      <Container>
        <AgentGroupsSearchDropdown selectedAgentGroup={ticket.group} onItemSelected={handleGroupItemSelected} />
        <AgentsSearchDropdown
          selectedAgentId={ticket.recentAssignment ? ticket.recentAssignment.agent.id : null}
          onItemSelected={handleAgentItemSelected}
          disabled={notPermittedToTransfer}
          contextualHelpContent={
            notPermittedToTransfer
              ? intl.formatMessage(
                  { id: 'desk.agentSelect.dropdown.disabled.tooltip.transferDisabled' },
                  { break: <br /> },
                )
              : undefined
          }
        />
      </Container>
    );
  },
);

TicketHeaderTransferActions.displayName = 'TicketHeaderTransferActions';
