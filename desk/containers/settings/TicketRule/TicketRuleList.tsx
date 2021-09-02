import { memo, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { deskApi } from '@api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAsync } from '@hooks';
import { HorizontalRuleText } from '@ui/components';

import { DraggableRuleProps, DraggableRule } from './DraggableRule';
import { TicketRuleConsequentType } from './constants';

const RuleDropZone = styled.ol``;

type Props = {
  rules: TicketRule[];
  isActionDisabled?: DraggableRuleProps['isActionDisabled'];
  onEdit: DraggableRuleProps['onEdit'];
  onDelete: DraggableRuleProps['onDelete'];
  onUpdateStatus: DraggableRuleProps['onUpdateStatus'];
  onReorder: (index: { startIndex: number; endIndex: number }) => void;
};

export const TicketRuleList = memo<Props>(
  ({ rules, isActionDisabled, onEdit, onDelete, onUpdateStatus, onReorder }) => {
    const intl = useIntl();
    const { pid, region } = useProjectIdAndRegion();

    const [{ data: agentsData }, fetchAgentsRequest] = useAsync(
      (ids: Agent['id'][]) => deskApi.fetchAgents(pid, region, { offset: 0, limit: 20, id: ids }),
      [pid, region],
    );

    const agentsMap = useMemo(() => {
      const map = new Map<Agent['id'], Agent>();
      agentsData?.data.results.forEach((agent) => {
        map.set(agent.id, agent);
      });
      return map;
    }, [agentsData]);

    useEffect(() => {
      const agentIds = rules.reduce((ids: Agent['id'][], rule: TicketRule) => {
        if (rule.conditional.consequent.type === TicketRuleConsequentType.GROUP_WITH_BOT_AGENT) {
          const consequentAgent = rule.conditional.consequent as TicketRuleConsequentGroupWithBotAgent;
          ids.push(consequentAgent._agent.value);
        }
        return ids;
      }, [] as Agent['id'][]);
      fetchAgentsRequest(agentIds);
    }, [fetchAgentsRequest, rules]);

    const onDragEnd = (result: DropResult) => {
      // dropped outside the list
      if (!result.destination) {
        return;
      }
      /**
       * @type TicketRule order starts with 1,
       * but the @library react-beautiful-dnd order mechanism starts with 0
       * so add 1 for the index came from the @library react-beautiful-dnd
       * */
      onReorder({ startIndex: result.source.index + 1, endIndex: result.destination.index + 1 });
    };

    return (
      <>
        <HorizontalRuleText>
          {intl.formatMessage({ id: 'desk.settings.ticketRules.list.order.description' })}
        </HorizontalRuleText>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="ticketRulesDroppable">
            {(provided) => (
              <RuleDropZone {...provided.droppableProps} ref={provided.innerRef}>
                {rules.map((rule, index) => (
                  <Draggable key={rule.id} draggableId={rule.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <DraggableRule
                        rule={rule}
                        agentsMap={agentsMap}
                        provided={provided}
                        snapshot={snapshot}
                        isActionDisabled={isActionDisabled}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onUpdateStatus={onUpdateStatus}
                      />
                    )}
                  </Draggable>
                ))}
              </RuleDropZone>
            )}
          </Droppable>
        </DragDropContext>
      </>
    );
  },
);
