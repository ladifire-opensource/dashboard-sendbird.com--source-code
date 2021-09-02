import { memo, useCallback, useMemo } from 'react';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import {
  Icon,
  Toggle,
  shadow,
  Subtitles,
  cssVariables,
  transitions,
  OverflowMenu,
  Tooltip,
  Lozenge,
  LozengeVariant,
  InlineNotification,
  ToggleProps,
  AvatarType,
} from 'feather';
import numbro from 'numbro';

import { TicketPriority } from '@constants';
import DeskBotAvatar from '@desk/components/DeskBotAvatar';
import { ArrowTag, HorizontalRuleText, TextWithOverflowTooltip, PriorityBadge } from '@ui/components';

import {
  TicketRuleMatch,
  TicketRuleStatus,
  ticketChannelKeyItem,
  ticketChannelTypeLabelWithSocialPrefix,
  TicketRuleConditionType,
  TicketRuleConditionOperator,
  TicketRuleConditionOperatorText,
  TicketRuleType,
  TicketRuleConsequentType,
} from './constants';
import { useRuleType } from './useRuleType';

const Rule = styled.li<{ isDragging: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr 142px;
  grid-column-gap: 12px;
  padding: 14px 20px 18px;
  border: 1px solid ${({ isDragging }) => (isDragging ? cssVariables('purple-7') : cssVariables('neutral-3'))};
  border-radius: 4px;
  transition: ${transitions({ duration: 0.2, properties: ['border', 'box-shadow'] })};
  background: rgba(255, 255, 255, 0.9);

  ${({ isDragging }) => isDragging && shadow[8]};

  & + & {
    margin-top: 8px;
  }

  &:hover {
    border-color: ${cssVariables('purple-7')};
    cursor: pointer;
  }

  &:focus:not(:active) {
    box-shadow: 0 0 0 2px ${cssVariables('purple-7')};
  }
`;

const DraggableHandle = styled.div`
  display: flex;
  align-items: center;
`;

const RuleTitle = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const RuleName = styled(TextWithOverflowTooltip)`
  max-width: 720px;
  width: auto;
  ${Subtitles['subtitle-03']};
`;

const RuleActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`;

const RuleStatusToggle = styled(Toggle)`
  margin-right: 8px;
`;

const RuleStatusLozengeOff = styled(Lozenge)`
  margin-left: 8px;
`;

const RuleConditions = styled.div`
  display: flex;
  align-items: flex-start;
  grid-column: 1 / span 2;
  grid-row: 2;
  padding-top: 16px;
`;

const RuleConditionsContainer = styled.div`
  margin-top: -1px;
  padding-left: 8px;
`;

const RuleConditionText = styled.span`
  display: inline-flex;
  align-items: center;
  margin: 0 8px;
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-9')};
`;

const RuleConditionNameOperatorText = styled.span``;

const RuleConditionValueText = styled(TextWithOverflowTooltip)`
  margin-left: 4px;
  max-width: 320px;
`;

const RuleConditionGroupContainer = styled.div`
  display: inline-flex;
  align-items: center;
  vertical-align: middle;

  &:first-child {
    ${RuleConditionText} {
      margin-left: 0;
    }
  }
`;

const RuleConsequentText = styled(RuleConditionText)`
  margin-right: 8px;
`;

const RuleConsequent = styled.div`
  grid-column: 1 / span 2;
  grid-row: 3;
  padding-top: 8px;
`;

const PriorityText = styled(PriorityBadge)`
  margin-left: 8px;
`;

const RuleError = styled.div`
  grid-column: 1 / span 3;
  grid-row: 4;
  padding-top: 16px;
`;

type RuleIntlRecord = {
  tooltip: string;
  consequentTo: string;
};
type RuleIntlKeys = { assignmentRules: RuleIntlRecord; priorityRules: RuleIntlRecord };

const INTL_KEYS: RuleIntlKeys = {
  assignmentRules: {
    tooltip: 'desk.settings.assignmentRules.list.dragHandle.tooltipContent',
    consequentTo: 'desk.settings.assignmentRules.list.consequent.to',
  },
  priorityRules: {
    tooltip: 'desk.settings.priorityRules.list.dragHandle.tooltipContent',
    consequentTo: 'desk.settings.priorityRules.list.consequent.to',
  },
};

type RuleConditionGroupProps = {
  match: TicketRuleMatch;
  condition: TicketRuleCondition;
  isFirst: boolean;
};

export type DraggableRuleProps = {
  rule: TicketRule;
  agentsMap: Map<Agent['id'], Agent>;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  isActionDisabled?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number, name: string) => void;
  onUpdateStatus: (id: number, name: string, checked: boolean) => void;
};

const RuleConditionGroup = memo<RuleConditionGroupProps>(({ match, condition, isFirst }) => {
  const intl = useIntl();

  const isMatchAll = match === TicketRuleMatch.AND;
  const horizontalRuleTextWidth = isMatchAll ? 46 : 39;

  const { key, type, name, operator, value } = condition;

  const getValueText = (value: string) => {
    if (key === ticketChannelKeyItem.key && ticketChannelTypeLabelWithSocialPrefix[value]) {
      return intl.formatMessage({ id: ticketChannelTypeLabelWithSocialPrefix[value] });
    }

    if (type === TicketRuleConditionType.NUMBER) {
      if (isNaN(parseInt(value, 10))) {
        return value;
      }
      return numbro(value).format({ thousandSeparated: true, mantissa: 0 });
    }
    return value;
  };

  const getOperatorText = useCallback(() => {
    const operatorSuffix =
      type === TicketRuleConditionType.NUMBER &&
      (operator === TicketRuleConditionOperator.Is || operator === TicketRuleConditionOperator.IsNot)
        ? '_for_number'
        : '';
    const operatorKey = `${operator}${operatorSuffix}`;

    return intl.formatMessage({ id: TicketRuleConditionOperatorText[operatorKey] });
  }, [intl, operator, type]);

  const valueText = value ? ` ${getValueText(value)}` : '';

  return (
    <RuleConditionGroupContainer>
      {!isFirst && (
        <HorizontalRuleText
          width={horizontalRuleTextWidth}
          textSize={11}
          textColor={cssVariables('neutral-5')}
          textSidePadding={4}
          hrColor={cssVariables('neutral-5')}
        >
          {intl.formatMessage({
            id: isMatchAll
              ? 'desk.settings.ticketRules.list.condition.match.all'
              : 'desk.settings.ticketRules.list.condition.match.any',
          })}
        </HorizontalRuleText>
      )}
      <RuleConditionText>
        <RuleConditionNameOperatorText>{`${name} ${getOperatorText()}`} </RuleConditionNameOperatorText>
        <RuleConditionValueText>
          {valueText !== '' &&
            intl.formatMessage({ id: 'desk.settings.ticketRules.list.condition.value' }, { conditionValue: valueText })}
        </RuleConditionValueText>
      </RuleConditionText>
    </RuleConditionGroupContainer>
  );
});

export const DraggableRule = memo<DraggableRuleProps>(
  ({ rule, agentsMap, provided, snapshot, isActionDisabled, onEdit, onDelete, onUpdateStatus }) => {
    const intl = useIntl();
    const currentRule = useRuleType();

    const {
      conditional: { match, conditions },
    } = rule;
    const isRuleStatusActive = rule.status === TicketRuleStatus.ON;

    const handleToggleClick: ToggleProps['onClick'] = useCallback(
      (checked, event) => {
        event.stopPropagation();
        onUpdateStatus(rule.id, rule.name, checked);
      },
      [onUpdateStatus, rule.id, rule.name],
    );

    const handleEditClick = useCallback(() => {
      if (!isActionDisabled) {
        onEdit(rule.id);
      }
    }, [isActionDisabled, onEdit, rule.id]);

    const actions = useMemo(
      () => [
        {
          label: intl.formatMessage({ id: 'desk.settings.ticketRules.list.overflowMenu.edit' }),
          disabled: isActionDisabled,
          onClick: () => {
            onEdit(rule.id);
          },
        },
        {
          label: intl.formatMessage({ id: 'desk.settings.ticketRules.list.overflowMenu.delete' }),
          disabled: isActionDisabled,
          onClick: () => {
            onDelete(rule.id, rule.name);
          },
        },
      ],
      [intl, isActionDisabled, onDelete, onEdit, rule.id, rule.name],
    );

    const intlKeysByRuleType = INTL_KEYS[currentRule.intlKeyByType] as RuleIntlRecord;

    return (
      <Rule
        role="listitem"
        ref={provided.innerRef}
        {...provided.draggableProps}
        isDragging={snapshot.isDragging}
        style={{ ...provided.draggableProps.style }}
        onClick={handleEditClick}
      >
        <DraggableHandle {...provided.dragHandleProps} role="gridcell">
          <Tooltip
            portalId="portal_tooltip"
            placement="right"
            content={intl.formatMessage({
              id: intlKeysByRuleType.tooltip,
            })}
            tooltipContentStyle="max-width: 300px; padding: 8px 16px; font-weight: 500"
          >
            <Icon size={20} icon="drag-handle" color={cssVariables('neutral-6')} />
          </Tooltip>
        </DraggableHandle>
        <RuleTitle role="gridcell">
          <RuleName>{rule.name}</RuleName>
          {!isRuleStatusActive && (
            <RuleStatusLozengeOff variant={LozengeVariant.Light} color="neutral">
              {intl.formatMessage({ id: 'desk.settings.ticketRules.list.ruleStatus.off' })}
            </RuleStatusLozengeOff>
          )}
        </RuleTitle>
        <RuleActions role="gridcell">
          <RuleStatusToggle checked={isRuleStatusActive} disabled={isActionDisabled} onClick={handleToggleClick} />
          <OverflowMenu items={actions} stopClickEventPropagation={true} popperProps={{ positionFixed: true }} />
        </RuleActions>
        <RuleConditions role="gridcell">
          <ArrowTag text={intl.formatMessage({ id: 'desk.settings.ticketRules.list.if' })} size="small" minWidth={44} />
          <RuleConditionsContainer>
            {conditions.map((condition, index) => (
              <RuleConditionGroup
                key={`${condition.key}-${condition.value}-${rule.order}-${index}`}
                match={match}
                condition={condition}
                isFirst={index === 0}
              />
            ))}
          </RuleConditionsContainer>
        </RuleConditions>
        <RuleConsequent role="gridcell">
          <ArrowTag
            text={intl.formatMessage({ id: 'desk.settings.ticketRules.list.then' })}
            size="small"
            minWidth={44}
          />
          {currentRule.type === TicketRuleType.ASSIGNMENT && (
            <RuleConsequentText>
              {intl.formatMessage(
                { id: intlKeysByRuleType.consequentTo },
                {
                  assignmentTarget:
                    rule.conditional.consequent.type === TicketRuleConsequentType.GROUP ? (
                      (rule.conditional.consequent as TicketRuleConsequentGroup)?._group?.name
                    ) : (
                      <>
                        <DeskBotAvatar
                          size={16}
                          type={AvatarType.Bot}
                          profileID={
                            (rule.conditional.consequent as TicketRuleConsequentGroupWithBotAgent)?._agent?.name || ''
                          }
                          imageUrl={
                            agentsMap.get(
                              (rule.conditional.consequent as TicketRuleConsequentGroupWithBotAgent)?._agent?.value,
                            )?.photoThumbnailUrl
                          }
                          css={`
                            margin-left: 4px !important;
                            margin-right: 4px;
                          `}
                        />
                        {(rule.conditional.consequent as TicketRuleConsequentGroupWithBotAgent)?._agent?.name}
                      </>
                    ),
                },
              )}
            </RuleConsequentText>
          )}
          {currentRule.type === TicketRuleType.PRIORITY && (
            <RuleConsequentText>
              {intl.formatMessage(
                { id: intlKeysByRuleType.consequentTo },
                {
                  priority: [
                    TicketPriority.URGENT,
                    TicketPriority.HIGH,
                    TicketPriority.MEDIUM,
                    TicketPriority.LOW,
                  ].includes((rule.conditional.consequent as TicketRuleConsequentPriority)?._priority?.value) ? (
                    <PriorityText
                      priority={(rule.conditional.consequent as TicketRuleConsequentPriority)?._priority.value}
                      showLabel={true}
                    />
                  ) : (
                    ''
                  ),
                },
              )}
            </RuleConsequentText>
          )}
        </RuleConsequent>
        {rule.error && (
          <RuleError role="gridcell">
            <InlineNotification
              type="error"
              message={intl.formatMessage({ id: 'desk.settings.ticketRules.list.error.broken' })}
            />
          </RuleError>
        )}
      </Rule>
    );
  },
);
