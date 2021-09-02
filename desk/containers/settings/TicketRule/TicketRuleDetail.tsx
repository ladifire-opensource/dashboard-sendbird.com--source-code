import { memo, Fragment, useEffect, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { useForm, useFieldArray, Controller, FieldError, DeepMap } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useRouteMatch, useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  toast,
  SpinnerFull,
  Headings,
  Button,
  IconButton,
  cssVariables,
  ScrollBar,
  InputText,
  Subtitles,
  Dropdown,
  DropdownProps,
  Tooltip,
  transitions,
  InlineNotification,
  InlineNotificationProps,
  NotificationType,
} from 'feather';
import camelCase from 'lodash/camelCase';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';

import { deskApi } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AgentType, TicketPriority } from '@constants';
import { AgentGroupsSearchDropdown } from '@desk/containers/agentGroupsSearchDropdown';
import { AgentsSearchDropdown } from '@desk/containers/agentsSearchDropdown';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useShowDialog, useAppId, useAsync, useErrorToast } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import {
  DrawerContext,
  ArrowTag,
  TextWithOverflowTooltip,
  TransitionedDrawer,
  transitionedDrawerTransitionDurationSecond,
  SlideTransition,
} from '@ui/components';

import { AssignmentConsequentTypeRadioGroup } from './AssignmentConsequentTypeRadioGroup';
import { PriorityRadioGroup } from './PriorityRadioGroup';
import { TicketRuleConditionValue } from './TicketRuleConditionValue';
import {
  TicketRuleType,
  TicketRuleMatch,
  TicketRuleConditionType,
  TicketRuleConditionOperator,
  conditionKeyGroupItem,
  ticketChannelKeyItem,
  customerUserIdKeyItem,
  customerUserNameKeyItem,
  TicketRuleConditionOperatorText,
  TicketRuleConsequentType,
  TicketRuleConditionErrorType,
  noValueOperators,
  preDefinedConditionKeys,
  textOperators,
  numberOperators,
  dropdownOperators,
  commonOperators,
  commonNoValueOperators,
  conditionKeyGroupKeys,
  TicketRuleConditionErrorMessage,
} from './constants';
import { useRuleType } from './useRuleType';

type MatchParams = {
  ruleId?: string;
};

const HEADER_HEIGHT = 54;
const FOOTER_HEIGHT = 64;
const ADD_BUTTON_WIDTH = 72;

const RuleDrawer = styled(TransitionedDrawer)`
  width: 560px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: ${HEADER_HEIGHT}px 1fr ${FOOTER_HEIGHT}px;
  height: 100%;
`;

const Item = styled.div<{ justifySelf?: string }>`
  display: flex;
  justify-self: ${({ justifySelf }) => justifySelf || 'start'};
  align-items: center;
  padding: 0 24px;
`;

const Title = styled(Item)`
  ${Headings['heading-03']};
`;

const DrawerCloseButton = styled(IconButton)`
  margin-right: -8px;
`;

const FormContainer = styled.div`
  grid-column: 1 / span 2;
  height: calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px);
  border-top: 1px solid ${cssVariables('neutral-3')};
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding: 24px;
  min-height: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;

  & + & {
    margin-top: 32px;
  }
`;

const FromGroupTitle = styled.h3`
  display: block;
  ${Headings['heading-01']}
`;
const FormGroupContent = styled.div`
  margin-top: 8px;
`;

const MatchContainer = styled.div`
  display: flex;
  align-items: center;
`;

const MatchTitle = styled.h4`
  margin-right: 4px;
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-6')};
`;

const MatchToggleRenderText = styled.div`
  margin-right: 4px;
  margin-left: 8px;
  ${Subtitles['subtitle-01']};
`;

const ConditionsContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 8px;
  margin-top: 12px;
`;

const InputTransition = styled.div<{ isHidden?: boolean }>`
  width: ${({ isHidden }) => (isHidden ? 0 : 'auto')};
  opacity: ${({ isHidden }) => (isHidden ? 0 : 1)};
  transform: translateX(${({ isHidden }) => (isHidden ? 16 : 0)}px);
  transition: ${transitions({ duration: 0.3, properties: ['opacity', 'transform'] })};
  overflow: ${({ isHidden }) => (isHidden ? 'hidden' : 'visible')};
`;

const ConditionRow = styled.ul`
  display: block;
`;

const ConditionColumn = styled(InputTransition)`
  display: inline-flex;
  margin: 0 ${({ isHidden }) => (isHidden ? 0 : 4)}px;
  padding-bottom: 4px;
  align-items: flex-start;
  vertical-align: top;
  list-style: none;

  &:first-child,
  &:last-child {
    margin: 0;
  }
`;

const KeyTitle = styled.section`
  margin-top: 6px;
  margin-bottom: -8px;
  font-size: 12px;
  font-weight: 500;
  color: ${cssVariables('neutral-6')};
  pointer-events: none;
`;

const ToggleOverflowText = styled(TextWithOverflowTooltip)`
  margin-left: 16px;
  max-width: 156px;
  font-weight: 500;
`;

const HiddenInputText = styled(InputText).attrs({ hidden: true })`
  width: 0;
  height: 0;
  margin: 0;
  overflow: hidden;
  pointer-events: none;

  & + & {
    margin: 0;
  }
`;

const ConsequentItems = styled.ul`
  list-style: none;
`;
const ConsequentItem = styled.li`
  & + & {
    margin-top: 16px;
  }
`;

const AddConditionButtonContainer = styled.div`
  width: ${ADD_BUTTON_WIDTH}px;
  grid-column: 1 / span 2;
`;

const RemoveConditionButton = styled(IconButton)`
  margin-top: 4px;
  margin-left: 4px;
`;

const AddButton = styled(Button)`
  min-width: ${ADD_BUTTON_WIDTH}px;
  transform: translateX(-8px);
`;

const DeleteButton = styled(Button)`
  transform: translateX(-12px);
`;

const CancelButton = styled(Button)`
  margin-right: 8px;
`;

const NUMBER_REGEX = new RegExp(/^[0-9]+$/);
const MAX_CUSTOM_FIELD_LIMIT = 100;
export const RULE_DRAWER_ID = 'RuleDrawer';
const FORM_ID = 'TeamAssignmentRuleForm';

const errorProcessor = (error: FieldError | undefined) => {
  return error?.message
    ? {
        hasError: true,
        message: typeof error.message === 'string' ? error.message : '',
      }
    : undefined;
};

const defaultCondition: TicketRuleConditionForForm = {
  key: null,
  operator: TicketRuleConditionOperator.Is,
  value: null,
};

const getFormTypeConsequent = (consequent: TicketRuleConsequent | TicketRuleConsequentForm) => {
  if (consequent.type === TicketRuleConsequentType.GROUP_WITH_BOT_AGENT) {
    return consequent as TicketRuleConsequentGroupWithBotAgentForm;
  }

  if (consequent.type === TicketRuleConsequentType.PRIORITY) {
    if (consequent['_priority'] !== undefined) {
      return consequent as TicketRuleConsequentPriorityForm;
    }

    const { type, key, value } = consequent as TicketRuleConsequentDeprecated;
    return {
      type,
      _priority: {
        key,
        value,
      },
    } as TicketRuleConsequentPriorityForm;
  }

  if (consequent['_group'] !== undefined) {
    return consequent as TicketRuleConsequentGroupForm;
  }

  const { type, key, value } = consequent as TicketRuleConsequentDeprecated;
  return {
    type,
    _group: {
      key,
      value,
    },
  } as TicketRuleConsequentGroupForm;
};

const isTicketRuleConsequentType = (value: unknown): value is TicketRuleConsequentType => {
  return [
    TicketRuleConsequentType.GROUP,
    TicketRuleConsequentType.GROUP_WITH_BOT_AGENT,
    TicketRuleConsequentType.PRIORITY,
  ].includes(value as any);
};

export const TicketRuleDetail = memo(() => {
  const intl = useIntl();
  const match = useRouteMatch<MatchParams>();
  const history = useHistory();
  const showDialog = useShowDialog();

  const appId = useAppId();
  const { pid, region } = useProjectIdAndRegion();
  const currentRuleType = useRuleType();
  const { getErrorMessage } = useDeskErrorHandler();

  const { openDrawer, closeDrawer } = useContext(DrawerContext);
  const [ruleError, setRuleError] = useState<TicketRuleError | null>(null);
  const [serverErrorKey, setServerErrorKey] = useState<'SAVE' | 'DELETE' | 'FETCH' | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const { ruleId } = match?.params as MatchParams;
  const isEdit = typeof ruleId === 'string' && NUMBER_REGEX.test(ruleId);

  const [consequentAgent, setConsequentAgent] = useState<Agent>();
  const [ticketCustomFields, setTicketCustomFields] = useState<CustomField[]>([]);
  const [customerCustomFields, setCustomerCustomFields] = useState<CustomField[]>([]);
  const [isFetchingCustomFields, setIsFetchingCustomFields] = useState(false);
  const [keyDropdownOptions, setKeyDropdownOptions] = useState<string[]>([]);
  const [isFormSubmittable, setIsFormSubmittable] = useState(false);
  const [removedIndexes, setRemovedIndexes] = useState<number[]>([]);

  const [selectedConsequentAgentGroup, setSelectedConsequentAgentGroup] = useState<AgentGroup<'listItem'> | null>(null);

  const keyMapRef = useRef<Map<string, TicketRuleConditionForKeyMap>>(new Map<string, TicketRuleConditionForKeyMap>());
  const valueMapRef = useRef<Map<string, CustomField['options']>>(new Map<string, CustomField['options']>());

  const defaultRuleData: {
    name: TicketRuleFormData['name'];
    conditional: {
      match: TicketRuleFormData['conditional']['match'];
      conditions: TicketRuleFormData['conditional']['conditions'];
      consequent: TicketRuleConsequentGroupForm | TicketRuleConsequentPriorityForm;
    };
  } = useMemo(() => {
    const defaultConsequent = (() => {
      if (currentRuleType.type === TicketRuleType.PRIORITY) {
        return {
          type: TicketRuleConsequentType.PRIORITY,
          _priority: {
            key: 'priority',
            value: null,
          },
        } as TicketRuleConsequentPriorityForm;
      }

      return {
        type: TicketRuleConsequentType.GROUP,
        _group: {
          key: 'id',
          value: null,
        },
      } as TicketRuleConsequentGroupForm;
    })();

    return {
      name: '',
      conditional: {
        match: TicketRuleMatch.OR,
        conditions: [defaultCondition],
        consequent: defaultConsequent,
      },
    };
  }, [currentRuleType.type]);

  const {
    register,
    errors,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState,
    reset,
    handleSubmit,
  } = useForm<TicketRuleFormData>({
    mode: 'onChange',
    defaultValues: defaultRuleData,
  });

  const { fields: conditionsFields, append, remove } = useFieldArray<TicketRuleConditionForForm>({
    control,
    name: 'conditional.conditions',
  });

  const previousFormDataRef = useRef<TicketRuleFormData>(defaultRuleData);

  const watchedRuleName: TicketRule['name'] = watch('name');
  const watchedConditional: TicketRuleFormData['conditional'] = watch('conditional');
  const watchedMatch = watch('conditional.match') as TicketRuleMatch;
  const watchedConditions = useMemo(
    () => (watchedConditional.conditions || [defaultCondition]) as TicketRuleCondition[],
    [watchedConditional.conditions],
  );
  const watchedConsequent: TicketRuleConsequentForm = watch('conditional.consequent');
  const watchedConsequentType = watch('conditional.consequent.type') as TicketRuleConsequentForm['type'];
  const isWatchedConditionalConsequentGroupWithBotAgent =
    watchedConsequentType === TicketRuleConsequentType.GROUP_WITH_BOT_AGENT;

  const [{ error: fetchAgentError, data: fetchAgentData }, fetchAgent] = useAsync(
    (agentId: Agent['id']) => deskApi.fetchAgent(pid, region, { agentId }),
    [pid, region],
  );

  useErrorToast(fetchAgentError, { ignoreDuplicates: true });

  const fetchTicketRuleRequest = useCallback(
    async ({ onSuccess }: { onSuccess: (refinedConsequent: TicketRuleConsequentForm) => void }) => {
      setIsFetching(true);
      try {
        const {
          data: {
            name,
            conditional: { match, conditions, consequent: rawConsequent },
            error,
          },
        } = await deskApi.fetchTicketRule(pid, region, { id: Number(ruleId) });
        /**
         * FIXME:
         * Remove legacy @type TicketRuleConsequentDeprecated when back-end data migration is done
         */
        const refinedConsequent = getFormTypeConsequent(rawConsequent);
        const formData: TicketRuleFormData = {
          name,
          conditional: {
            match,
            conditions,
            consequent: refinedConsequent,
          },
        };
        reset(formData);
        setRuleError(error);
        onSuccess(refinedConsequent);
        previousFormDataRef.current = formData;
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        setServerErrorKey('FETCH');
      } finally {
        setIsFetching(false);
      }
    },
    [getErrorMessage, pid, region, reset, ruleId],
  );

  const createTicketRuleRequest = useCallback(
    async ({ name, conditional }) => {
      setIsFetching(true);
      try {
        const { status } = await deskApi.createTicketRule(pid, region, {
          type: currentRuleType.type,
          name,
          conditional,
        });
        toast.success({
          message: intl.formatMessage({ id: `desk.settings.${currentRuleType.intlKeyByType}.toast.create.success` }),
        });
        return status === 200;
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        setServerErrorKey('SAVE');
        return false;
      } finally {
        setIsFetching(false);
      }
    },
    [currentRuleType.intlKeyByType, currentRuleType.type, getErrorMessage, intl, pid, region],
  );

  const updateTicketRuleRequest = useCallback(
    async ({ name, conditional }) => {
      setIsFetching(true);
      try {
        const { status } = await deskApi.updateTicketRule(pid, region, {
          id: Number(ruleId),
          name,
          conditional,
        });
        toast.success({
          message: intl.formatMessage({ id: `desk.settings.${currentRuleType.intlKeyByType}.toast.update.success` }),
        });
        return status === 200;
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        setServerErrorKey('SAVE');
        return false;
      } finally {
        setIsFetching(false);
      }
    },
    [currentRuleType.intlKeyByType, getErrorMessage, intl, pid, region, ruleId],
  );

  const deleteTicketRuleRequest = useCallback(async () => {
    setIsFetching(true);
    try {
      const { status: statusCode } = await deskApi.deleteTicketRule(pid, region, { id: Number(ruleId) });
      toast.success({
        message: intl.formatMessage({ id: `desk.settings.${currentRuleType.intlKeyByType}.toast.delete.success` }),
      });
      return statusCode === 200;
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
      setServerErrorKey('DELETE');
      return false;
    } finally {
      setIsFetching(false);
    }
  }, [currentRuleType.intlKeyByType, getErrorMessage, intl, pid, region, ruleId]);

  const fetchSelectedConsequentAgentGroup = useCallback(
    async ({ selectedAgentGroupId }) => {
      try {
        const {
          data: { members, ...rest },
        } = await deskApi.fetchAgentGroup(pid, region, { groupId: selectedAgentGroupId });
        const refinedConsequentAgentGroup: AgentGroup<'listItem'> = { ...rest, memberCount: members.length };
        setSelectedConsequentAgentGroup(refinedConsequentAgentGroup);
      } catch (error) {
        // ignoring error
      }
    },
    [pid, region],
  );

  const fetchCustomFieldsRequest = useCallback(async () => {
    setIsFetchingCustomFields(true);
    try {
      const {
        data: { results: ticketFields },
      } = await deskApi.fetchTicketFields(pid, region, { offset: 0, limit: MAX_CUSTOM_FIELD_LIMIT });
      const {
        data: { results: customerFields },
      } = await deskApi.fetchCustomerFields(pid, region, { offset: 0, limit: MAX_CUSTOM_FIELD_LIMIT });
      setTicketCustomFields(ticketFields);
      setCustomerCustomFields(customerFields);
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
      setServerErrorKey('FETCH');
    } finally {
      setIsFetchingCustomFields(false);
    }
  }, [getErrorMessage, pid, region]);

  const convertCustomFieldTypeToTicketConditionType = (fieldType: CustomField['fieldType']) => {
    switch (fieldType) {
      case 'STRING':
        return TicketRuleConditionType.TEXT;
      case 'INTEGER':
        return TicketRuleConditionType.NUMBER;
      default:
        return TicketRuleConditionType.DROPDOWN;
    }
  };

  const createCustomFieldKeyMap = useCallback((customFields: CustomField[], keyPrefix: string) => {
    sortBy(customFields, (field) => field.name.toLowerCase())
      .filter((customField) => customField.fieldType !== 'LINK')
      .forEach((customField) => {
        const item = {
          type: convertCustomFieldTypeToTicketConditionType(customField.fieldType),
          name: customField.name,
          key: `${keyPrefix}.${customField.key}`,
          operator: TicketRuleConditionOperator.Is,
          value: null,
        };
        keyMapRef.current.set(item.key, item);
      });
  }, []);

  const createDefaultKeyMap = useCallback(
    (ticketFields: CustomField[], customerFields: CustomField[]) => {
      keyMapRef.current.clear();
      keyMapRef.current.set(conditionKeyGroupItem.ticket.key, conditionKeyGroupItem.ticket);
      keyMapRef.current.set(ticketChannelKeyItem.key, ticketChannelKeyItem);
      if (ticketFields.length > 0) {
        keyMapRef.current.set(conditionKeyGroupItem.ticketField.key, conditionKeyGroupItem.ticketField);
        createCustomFieldKeyMap(ticketFields, 'ticket_field.key');
      }
      keyMapRef.current.set(conditionKeyGroupItem.customer.key, conditionKeyGroupItem.customer);
      keyMapRef.current.set(customerUserIdKeyItem.key, customerUserIdKeyItem);
      keyMapRef.current.set(customerUserNameKeyItem.key, customerUserNameKeyItem);
      if (customerFields.length > 0) {
        keyMapRef.current.set(conditionKeyGroupItem.customerField.key, conditionKeyGroupItem.customerField);
        createCustomFieldKeyMap(customerFields, 'customer_field.key');
      }
    },
    [createCustomFieldKeyMap],
  );

  const createValueMap = useCallback((ticketFields: CustomField[], customerFields: CustomField[]) => {
    ticketFields
      .filter((customField) => customField.fieldType === 'DROPDOWN')
      .forEach((customField) => {
        valueMapRef.current.set(`ticket_field.key.${customField.key}`, customField.options);
      });
    customerFields
      .filter((customField) => customField.fieldType === 'DROPDOWN')
      .forEach((customField) => {
        valueMapRef.current.set(`customer_field.key.${customField.key}`, customField.options);
      });
  }, []);

  const getDefaultKeyOptions = useCallback(() => {
    return Array.from(keyMapRef.current.values(), (conditionData) => conditionData.key as string);
  }, []);

  const createKeyDropdownOptions = useCallback(() => {
    const keyOptions: string[] = getDefaultKeyOptions();
    setKeyDropdownOptions(keyOptions);
  }, [getDefaultKeyOptions]);

  const matchOptionLabel = useMemo(
    () => ({
      or: intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.conditional.match.option.any' }),
      and: intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.conditional.match.option.all' }),
    }),
    [intl],
  );

  /**
   * FIXME:
   * The below hard coded validation is required because formState.isValid is not working properly with useFieldArray.
   * If it is fixed in future versions of react-hook-form,
   * feel free to remove this method and replace it with formState.isValid.
   */

  const checkIsFormUpdatable = useCallback(() => {
    if (
      !!previousFormDataRef.current &&
      watchedMatch !== undefined &&
      watchedConditions !== undefined &&
      watchedConsequent !== undefined
    ) {
      const {
        name: prevName,
        conditional: { match: prevMatch, conditions: prevConditions, consequent: prevConsequent },
      } = previousFormDataRef.current;

      const isRuleNameDifferent = prevName.trim() !== watchedRuleName.trim();
      const isMatchDifferent = prevMatch !== watchedMatch;

      const isConsequentValueValidAndDifferent = (() => {
        if (currentRuleType.type === TicketRuleType.PRIORITY) {
          const prev = prevConsequent as TicketRuleConsequentPriority;
          const current = watchedConsequent as TicketRuleConsequentPriorityForm;
          return !!current._priority?.value && prev._priority?.value !== current._priority.value;
        }

        if (watchedConsequentType === TicketRuleConsequentType.GROUP_WITH_BOT_AGENT) {
          const prev = prevConsequent as TicketRuleConsequentGroupWithBotAgent;
          const current = watchedConsequent as TicketRuleConsequentGroupWithBotAgentForm;
          return (
            !!current._agent?.value &&
            !!current._group?.value &&
            (prev._group?.value !== current._group.value || prev._agent?.value !== current._agent.value)
          );
        }

        if (watchedConsequentType === TicketRuleConsequentType.GROUP) {
          const prev = prevConsequent as TicketRuleConsequentGroup;
          const current = watchedConsequent as TicketRuleConsequentGroupForm;
          return !!current._group?.value && prev._group?.value !== current._group.value;
        }

        return false;
      })();

      const isFieldBesidesConditionsUpdated = isEdit
        ? isRuleNameDifferent || isMatchDifferent || isConsequentValueValidAndDifferent
        : isRuleNameDifferent && isConsequentValueValidAndDifferent;

      const isConditionsUpdated =
        (prevConditions.length !== watchedConditions?.length &&
          watchedConditions?.every(
            (condition) =>
              condition.key != null &&
              ((!noValueOperators.includes(condition.operator) && condition.value != null) ||
                noValueOperators.includes(condition.operator)),
          )) ||
        (prevConditions.length === watchedConditions?.length &&
          prevConditions.some(
            (prevCondition, index) =>
              watchedConditions[index]?.key &&
              watchedConditions[index]?.operator &&
              (noValueOperators.includes(watchedConditions[index].operator) || watchedConditions[index]?.value) &&
              (prevCondition.key !== watchedConditions[index]?.key ||
                prevCondition.operator !== watchedConditions[index]?.operator ||
                prevCondition.value !== watchedConditions[index]?.value),
          ));

      return isEdit
        ? isFieldBesidesConditionsUpdated || isConditionsUpdated
        : isFieldBesidesConditionsUpdated && isConditionsUpdated;
    }

    return false;
  }, [
    currentRuleType.type,
    isEdit,
    watchedConditions,
    watchedConsequent,
    watchedConsequentType,
    watchedMatch,
    watchedRuleName,
  ]);

  const onFetchTicketRuleSuccess = useCallback(
    (refinedConsequent: TicketRuleConsequentForm) => {
      // fetch selected agent group when form data is fetched
      if (
        [TicketRuleConsequentType.GROUP, TicketRuleConsequentType.GROUP_WITH_BOT_AGENT].includes(refinedConsequent.type)
      ) {
        const selectedAgentGroupId =
          (refinedConsequent as TicketRuleConsequentGroupForm | TicketRuleConsequentGroupWithBotAgentForm)?._group
            ?.value ?? undefined;
        if (selectedAgentGroupId !== undefined) {
          fetchSelectedConsequentAgentGroup({ selectedAgentGroupId });
        }
      }

      //  fetch selected agent data when form data is fetched and its consequent type is TicketRuleConsequentType.GROUP_WITH_BOT_AGENT
      if (refinedConsequent.type === TicketRuleConsequentType.GROUP_WITH_BOT_AGENT && refinedConsequent._agent.value) {
        fetchAgent(refinedConsequent._agent.value);
      }
    },
    [fetchAgent, fetchSelectedConsequentAgentGroup],
  );

  const updateIsFormSubmittable = useCallback(() => {
    const isFormUpdatable = checkIsFormUpdatable();
    setIsFormSubmittable(isFormUpdatable && isEmpty(errors));
  }, [checkIsFormUpdatable, errors]);

  useEffect(() => {
    if (fetchAgentData) {
      setConsequentAgent(fetchAgentData.data);
    }
  }, [fetchAgentData]);

  useEffect(() => {
    updateIsFormSubmittable();
  }, [updateIsFormSubmittable]);

  useEffect(() => {
    fetchCustomFieldsRequest();
  }, [fetchCustomFieldsRequest]);

  useEffect(() => {
    createDefaultKeyMap(ticketCustomFields, customerCustomFields);
    createValueMap(ticketCustomFields, customerCustomFields);
    createKeyDropdownOptions();
  }, [createKeyDropdownOptions, createDefaultKeyMap, ticketCustomFields, customerCustomFields, createValueMap]);

  useEffect(() => {
    if (isEdit) {
      fetchTicketRuleRequest({ onSuccess: onFetchTicketRuleSuccess });
    }
  }, [fetchTicketRuleRequest, isEdit, onFetchTicketRuleSuccess]);

  useEffect(() => {
    openDrawer(RULE_DRAWER_ID);
  }, [openDrawer]);

  useEffect(() => {
    if (ruleError) {
      const {
        conditional: { conditions, consequent },
      } = ruleError;

      if (!!conditions && conditions.length > 0) {
        conditions.forEach(({ errors, index: errorIndex }) => {
          errors.forEach((error) => {
            const errorReason = intl.formatMessage(
              {
                id: `desk.settings.ticketRulesDetail.form.conditions.serverError.${camelCase(error.reason)}`,
              },
              { type: error.type.toLowerCase() },
            );
            setError(`conditional.conditions[${errorIndex}].${error.type.toLowerCase()}`, {
              type: error.type,
              message: errorReason,
            });
          });
        });
      }

      if (consequent?.errors) {
        consequent.errors.forEach((error) => {
          const { type, reason: message } = error;
          setError(`conditional.consequent.${type}.value`, { type, message });
        });
      }

      if ((!conditions || conditions?.length === 0) && !consequent) {
        setRuleError(null);
      }
    }
  }, [intl, removedIndexes, ruleError, setError]);

  const getConditionPrefixText = useCallback(
    (index: number) => {
      if (index === 0) {
        return intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.conditions.prefix.if' });
      }

      if (watchedMatch === TicketRuleMatch.AND) {
        return intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.conditions.prefix.all' });
      }
      return intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.conditions.prefix.any' });
    },
    [intl, watchedMatch],
  );

  const getKeyLabel = useCallback(
    (key: string) => {
      const isUsingIntlKeyName = !!preDefinedConditionKeys.find((preDefinedKey) => preDefinedKey === key);
      const name = keyMapRef.current.get(key)?.name || '';
      return isUsingIntlKeyName && name ? intl.formatMessage({ id: name }) : name;
    },
    [intl],
  );

  const getOperatorLabel = useCallback(
    (params: { index: number; operator: string }) => {
      const { index, operator } = params;
      const key = watchedConditions[index]?.key ?? null;

      if (key) {
        const type = keyMapRef.current.get(key)?.type || TicketRuleConditionOperator.Is;
        const operatorSuffix =
          type === TicketRuleConditionType.NUMBER &&
          (operator === TicketRuleConditionOperator.Is || operator === TicketRuleConditionOperator.IsNot)
            ? '_for_number'
            : '';
        const operatorKey = `${operator}${operatorSuffix}`;

        return intl.formatMessage({ id: TicketRuleConditionOperatorText[operatorKey] });
      }
      return '';
    },
    [intl, watchedConditions],
  );

  const getConditionOperatorItems = useCallback(
    (index: number) => {
      const currentCondition = watchedConditions ? watchedConditions[index] : undefined;
      const conditionType =
        currentCondition?.key && keyMapRef.current.has(currentCondition.key)
          ? keyMapRef.current.get(currentCondition.key)?.type
          : TicketRuleConditionType.DROPDOWN;

      if (conditionType === TicketRuleConditionType.TEXT) {
        return textOperators;
      }

      if (conditionType === TicketRuleConditionType.NUMBER) {
        return numberOperators;
      }

      if (conditionType === TicketRuleConditionType.DROPDOWN) {
        return dropdownOperators;
      }

      return [...commonOperators, ...commonNoValueOperators];
    },
    [watchedConditions],
  );

  const handleAppendConditionClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      event.preventDefault();
      append(defaultCondition);
    },
    [append],
  );

  const removeServerRuleError = useCallback(
    (index) => {
      if (!!ruleError && !!ruleError.conditional.conditions && ruleError.conditional.conditions.length > 0) {
        const ruleErrorIndex = ruleError.conditional.conditions?.findIndex((error) => error.index === index);
        if (ruleErrorIndex !== undefined && ruleErrorIndex >= 0) {
          setRuleError({
            ...ruleError,
            conditional: {
              ...ruleError.conditional,
              conditions: [
                ...ruleError.conditional.conditions.slice(0, ruleErrorIndex),
                ...ruleError.conditional.conditions
                  .slice(ruleErrorIndex + 1)
                  .map((error) => ({ ...error, index: error.index - 1 })),
              ],
            },
          });
          return;
        }

        setRuleError({
          ...ruleError,
          conditional: {
            ...ruleError.conditional,
            conditions: ruleError.conditional.conditions?.map((error) => {
              if (error.index > index) {
                return { ...error, index: error.index - 1 };
              }
              return error;
            }),
          },
        });
      }
    },
    [ruleError],
  );

  const removeServerRuleErrorValue = useCallback(
    (index) => {
      const ruleErrorIndex = ruleError?.conditional.conditions?.findIndex(
        (error) => error.index === index && error.errors.some((conditionError) => conditionError.type === 'VALUE'),
      );
      if (ruleError?.conditional.conditions && ruleErrorIndex && ruleErrorIndex >= 0) {
        setRuleError({
          ...ruleError,
          conditional: {
            ...ruleError.conditional,
            conditions: [
              ...ruleError.conditional.conditions.slice(0, ruleErrorIndex),
              {
                ...ruleError.conditional.conditions[ruleErrorIndex],
                errors: ruleError.conditional.conditions[ruleErrorIndex].errors.filter(
                  (error) => error.type === TicketRuleConditionErrorType.VALUE,
                ),
              },
              ...ruleError.conditional.conditions.slice(ruleErrorIndex + 1),
            ],
          },
        });
      }
    },
    [ruleError],
  );

  const handleRemoveConditionClick = useCallback(
    (index: number) => () => {
      watchedConditions.forEach((_, conditionIndex) => {
        if (conditionIndex >= index) {
          clearErrors([
            `conditional.conditions[${conditionIndex}].key`,
            `conditional.conditions[${conditionIndex}].value`,
          ]);
        }
      });
      removeServerRuleError(index);
      setRemovedIndexes([...removedIndexes, index]);
      remove(index);
    },
    [clearErrors, remove, removeServerRuleError, removedIndexes, watchedConditions],
  );

  const closeDrawerWithPush = useCallback(() => {
    closeDrawer(RULE_DRAWER_ID);

    // wait for the closing animation of the drawer
    setTimeout(() => {
      history.push(`/${appId}/desk/settings/${currentRuleType.pathname}`);
    }, transitionedDrawerTransitionDurationSecond * 1000);
  }, [appId, closeDrawer, currentRuleType.pathname, history]);

  const handleDrawerCloseClick = useCallback(() => {
    const isUnsaved = isEdit ? checkIsFormUpdatable() : formState.isDirty;
    if (isUnsaved) {
      showDialog({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          title: intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.dialog.title' }),
          description: intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.dialog.description' }),
          cancelText: intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.dialog.button.cancel' }),
          confirmText: intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.dialog.button.discard' }),
          onConfirm: () => {
            closeDrawerWithPush();
          },
        },
      });
      return;
    }

    closeDrawerWithPush();
  }, [checkIsFormUpdatable, closeDrawerWithPush, formState.isDirty, intl, isEdit, showDialog]);

  const handleKeyDropdownClick = () => {
    fetchCustomFieldsRequest();
  };

  const handleConditionKeyItemSelected = useCallback(
    (index: number) => (key) => {
      clearErrors([`conditional.conditions[${index}].key`, `conditional.conditions[${index}].value`]);
      removeServerRuleError(index);
      /**
       * FIXME:
       * Condition value should:
       * - be null when key is changed
       * - keep its defaultValue when any condition field is removed
       *
       * When key item is updated, it is impossible to set null value with setValue method on right timing.
       * If trying to set null asynchronously with setValue method, yes it works but UI blinks between defaultValue and null value.
       * The reset method can solve this problem, but it is not a perfect solution.
       */
      reset(
        {
          name: watchedRuleName,
          conditional: {
            ...watchedConditional,
            conditions: [
              ...watchedConditions.slice(0, index),
              { key, operator: TicketRuleConditionOperator.Is, value: null },
              ...watchedConditions.slice(index + 1),
            ],
          },
        },
        {
          errors: true, // errors will not be reset
          dirtyFields: true, // dirtyFields will not be reset
          isDirty: true, // isDirty will not be reset
        },
      );
    },
    [clearErrors, removeServerRuleError, reset, watchedConditional, watchedConditions, watchedRuleName],
  );

  const handleConditionOperatorItemSelected = useCallback(
    (index: number) => () => {
      removeServerRuleErrorValue(index);
    },
    [removeServerRuleErrorValue],
  );

  const handleConditionValueItemSelected = useCallback(
    (index: number) => () => {
      removeServerRuleErrorValue(index);
    },
    [removeServerRuleErrorValue],
  );

  const removeConsequentRuleError = useCallback(() => {
    if (ruleError) {
      setRuleError({
        ...ruleError,
        conditional: {
          ...ruleError.conditional,
          consequent: null,
        },
      });
      clearErrors('conditional.consequent._group.value');
      if (isWatchedConditionalConsequentGroupWithBotAgent) {
        clearErrors('conditional.consequent._agent.value');
      }
    }
  }, [clearErrors, isWatchedConditionalConsequentGroupWithBotAgent, ruleError]);

  const resetConsequentForAssignment = useCallback(
    (type: TicketRuleConsequentType) => {
      reset(
        {
          name: watchedRuleName,
          conditional: {
            ...watchedConditional,
            consequent: {
              ...watchedConditional.consequent,
              type,
              _group: {
                key: 'id',
                value: null,
              },
              _agent: {
                key: 'id',
                value: null,
              },
            },
          },
        },
        {
          errors: true, // errors will not be reset
          dirtyFields: true, // dirtyFields will not be reset
          isDirty: true, // isDirty will not be reset
        },
      );
      setConsequentAgent(undefined);
    },
    [reset, watchedConditional, watchedRuleName],
  );

  const handleAssignmentConsequentTypeChange = useCallback(
    (type: TicketRuleConsequentType) => {
      resetConsequentForAssignment(type);
      removeConsequentRuleError();
      setSelectedConsequentAgentGroup(null);
      updateIsFormSubmittable();
    },
    [removeConsequentRuleError, resetConsequentForAssignment, updateIsFormSubmittable],
  );

  const onConsequentValueItemSelected = useCallback(
    (params: { fieldName: string; value: AgentGroup<'listItem'>['id'] | Agent['id'] }) => {
      const { fieldName, value } = params;
      setValue(fieldName, value);
      clearErrors(fieldName);
      removeConsequentRuleError();
    },
    [clearErrors, removeConsequentRuleError, setValue],
  );

  const handleAgentGroupDropdownItemSelected = useCallback(
    (item: AgentGroup<'listItem'>) => {
      onConsequentValueItemSelected({ fieldName: 'conditional.consequent._group.value', value: item.id });
      setSelectedConsequentAgentGroup(item);

      // Reset bot agent dropdown whenever the value of agent group dropdown is changed
      if (isWatchedConditionalConsequentGroupWithBotAgent) {
        setValue('conditional.consequent._agent.value', null);
      }
    },
    [isWatchedConditionalConsequentGroupWithBotAgent, onConsequentValueItemSelected, setValue],
  );

  const handleAgentDropdownItemSelected = useCallback(
    (item: Agent) => {
      onConsequentValueItemSelected({ fieldName: 'conditional.consequent._agent.value', value: item.id });
      setConsequentAgent(item);
    },
    [onConsequentValueItemSelected],
  );

  const handleDeleteClick = useCallback(() => {
    showDialog({
      dialogTypes: DialogType.Delete,
      dialogProps: {
        title: intl.formatMessage(
          { id: 'desk.settings.ticketRules.dialog.delete.title' },
          {
            ruleName: watchedRuleName,
          },
        ),
        description: intl.formatMessage({
          id: `desk.settings.${currentRuleType.intlKeyByType}.dialog.delete.description`,
        }),
        confirmText: intl.formatMessage({ id: 'desk.settings.ticketRules.dialog.delete.button' }),
        cancelText: intl.formatMessage({ id: 'desk.settings.ticketRules.dialog.cancel.button' }),
        onDelete: async (setIsDeleting) => {
          setIsDeleting(true);
          if (await deleteTicketRuleRequest()) {
            closeDrawerWithPush();
          }
        },
      },
    });
  }, [showDialog, intl, watchedRuleName, currentRuleType.intlKeyByType, deleteTicketRuleRequest, closeDrawerWithPush]);

  const onSubmit = useCallback(
    async (data) => {
      let isSucceedSave = false;
      const formValuesWithTrimmedName = { ...data, name: data.name.trim() };
      if (isEdit) {
        await updateTicketRuleRequest(formValuesWithTrimmedName).then((isUpdated) => {
          isSucceedSave = isUpdated;
        });
      } else {
        await createTicketRuleRequest(formValuesWithTrimmedName).then((isCreated) => {
          isSucceedSave = isCreated;
        });
      }

      if (isSucceedSave) {
        closeDrawerWithPush();
      }
    },
    [closeDrawerWithPush, createTicketRuleRequest, isEdit, updateTicketRuleRequest],
  );

  const retryErrorLabel = intl.formatMessage({
    id: 'desk.settings.ticketRulesDetail.form.serverError.button.retry',
  });
  const serverErrors = useMemo(
    () => ({
      SAVE: {
        intlKey: 'desk.settings.ticketRulesDetail.form.serverError.save',
        action: undefined,
      },
      DELETE: {
        intlKey: 'desk.settings.ticketRulesDetail.form.serverError.delete',
        action: {
          label: retryErrorLabel,
          onClick: handleDeleteClick,
        },
      },
      FETCH: {
        intlKey: 'desk.settings.ticketRulesDetail.form.serverError.fetch',
        action: {
          label: retryErrorLabel,
          onClick: () => {
            fetchTicketRuleRequest({ onSuccess: onFetchTicketRuleSuccess });
            fetchCustomFieldsRequest();
          },
        },
      },
    }),
    [fetchCustomFieldsRequest, fetchTicketRuleRequest, handleDeleteClick, onFetchTicketRuleSuccess, retryErrorLabel],
  );

  /**
   * @const inlineNotificationErrorMessageRef {string} is used for inline notification to store the error message,
   * so when the error is gone, it keeps showing the error message until the end of animation to disappear.
   * You can see the returned object at the end of @const conditionsError,
   * which triggers disappearing animation and uses @const inlineNotificationErrorMessageRef as message
   */
  const inlineNotificationErrorMessageRef = useRef<string>();
  const inlineNotificationError: InlineNotificationProps & { isRender: boolean } = (() => {
    const conditionsError = errors.conditional?.conditions ?? [];
    if (
      conditionsError.some(
        (conditionError) =>
          conditionError?.value?.message === TicketRuleConditionErrorMessage.INVALID_CHANNEL_BY_CONSEQUENT_CUSTOM_BOT,
      )
    ) {
      const message = intl.formatMessage({
        id: 'desk.settings.ticketRulesDetail.form.conditions.value.error.inline.custom',
      });
      inlineNotificationErrorMessageRef.current = message;
      return { isRender: true, type: 'error' as NotificationType, message };
    }

    if (
      conditionsError.some(
        (conditionError) =>
          conditionError?.value?.message === TicketRuleConditionErrorMessage.INVALID_CHANNEL_BY_CONSEQUENT_FAQ_BOT,
      )
    ) {
      const message = intl.formatMessage({
        id: 'desk.settings.ticketRulesDetail.form.conditions.value.error.inline.faq',
      });
      inlineNotificationErrorMessageRef.current = message;
      return { isRender: true, type: 'error' as NotificationType, message };
    }

    if (serverErrorKey != null) {
      const message = intl.formatMessage({ id: serverErrors[serverErrorKey].intlKey });
      inlineNotificationErrorMessageRef.current = message;
      return {
        isRender: true,
        type: 'error' as NotificationType,
        message,
        action: serverErrors[serverErrorKey].action,
      };
    }

    return {
      isRender: false,
      type: 'error' as NotificationType,
      message: inlineNotificationErrorMessageRef.current,
    };
  })();

  const keyToggleRenderer: DropdownProps<TicketRuleCondition['key']>['toggleRenderer'] = ({ selectedItem }) =>
    selectedItem && <ToggleOverflowText>{getKeyLabel(selectedItem)}</ToggleOverflowText>;

  return (
    <RuleDrawer id={RULE_DRAWER_ID} isFullHeight={true} isDarkBackground={true}>
      {(isFetching || isFetchingCustomFields) && <SpinnerFull transparent={true} />}
      <Grid>
        <Title as="h2">
          {isEdit
            ? intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.title.edit' })
            : intl.formatMessage({ id: `desk.settings.${currentRuleType.intlKeyByType}.title.create` })}
        </Title>
        <Item justifySelf="end">
          <DrawerCloseButton
            icon="close"
            role="button"
            buttonType="secondary"
            size="small"
            onClick={handleDrawerCloseClick}
          />
        </Item>

        <FormContainer>
          <ScrollBar style={{ height: '100%' }}>
            <Form id={FORM_ID} role="form" onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <FromGroupTitle>
                  {intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.ruleName.title' })}
                </FromGroupTitle>
                <FormGroupContent>
                  <InputText
                    ref={register({
                      validate: {
                        required: (value) =>
                          value.trim().length > 0 ||
                          intl.formatMessage({
                            id: 'desk.settings.ticketRulesDetail.form.name.error.required',
                          }),
                        maxLength: (value) =>
                          value.trim().length <= 100 ||
                          intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.name.error.maximum' }),
                      },
                    })}
                    name="name"
                    error={errorProcessor(errors['name'])}
                  />
                </FormGroupContent>
              </FormGroup>
              <FormGroup>
                <FromGroupTitle>
                  {intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.conditions.title' })}
                </FromGroupTitle>
                <FormGroupContent>
                  <MatchContainer>
                    <MatchTitle>
                      {intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.conditional.match' })}
                    </MatchTitle>
                    <Controller
                      control={control}
                      rules={{ required: true }}
                      name="conditional.match"
                      render={({ onChange, value }) => {
                        return (
                          <Dropdown<TicketRuleMatch>
                            selectedItem={value}
                            onChange={onChange}
                            portalId="portal_popup"
                            variant="inline"
                            items={[TicketRuleMatch.OR, TicketRuleMatch.AND]}
                            itemToString={(item) => matchOptionLabel[item]}
                            itemToElement={(item) => matchOptionLabel[item]}
                            toggleRenderer={({ selectedItem }) =>
                              selectedItem && (
                                <MatchToggleRenderText>{matchOptionLabel[selectedItem]}</MatchToggleRenderText>
                              )
                            }
                          />
                        );
                      }}
                    />
                  </MatchContainer>
                  <ConditionsContainer>
                    {conditionsFields.map((field, index) => {
                      return (
                        <Fragment key={field.id}>
                          <ArrowTag text={getConditionPrefixText(index)} minWidth={48} />
                          <ConditionRow role="row">
                            <ConditionColumn as="li" onClick={handleKeyDropdownClick}>
                              <Controller
                                control={control}
                                rules={{ required: true }}
                                name={`conditional.conditions[${index}].key`}
                                defaultValue={field.key}
                                render={({ onChange, value }) => {
                                  return (
                                    <Dropdown<TicketRuleConditionForForm['key']>
                                      selectedItem={value}
                                      onChange={onChange}
                                      portalId="portal_popup"
                                      placeholder={intl.formatMessage({
                                        id: 'desk.settings.ticketRulesDetail.form.conditions.dropdown.placeholder',
                                      })}
                                      items={keyDropdownOptions}
                                      itemToString={(key: string) => getKeyLabel(key)}
                                      itemToElement={(key: string) => {
                                        const keyLabel = getKeyLabel(key);
                                        if (conditionKeyGroupKeys.find((titleKey) => titleKey === key)) {
                                          return <KeyTitle>{keyLabel}</KeyTitle>;
                                        }
                                        return <>{keyLabel}</>;
                                      }}
                                      toggleRenderer={watchedConditions[index]?.key ? keyToggleRenderer : undefined}
                                      isItemDisabled={(key) =>
                                        !!conditionKeyGroupKeys.find((titleKey) => titleKey === key)
                                      }
                                      onItemSelected={handleConditionKeyItemSelected(index)}
                                      hasError={!!errors?.conditional?.conditions?.[index]?.key || false}
                                    />
                                  );
                                }}
                              />
                            </ConditionColumn>
                            <ConditionColumn as="li" isHidden={!field.key && !watchedConditions[index]?.key}>
                              <Controller
                                control={control}
                                name={`conditional.conditions[${index}].operator`}
                                portalId="portal_popup"
                                defaultValue={field.operator}
                                render={({ onChange, value }) => {
                                  return (
                                    <Dropdown<TicketRuleConditionOperator>
                                      placeholder={intl.formatMessage({
                                        id: 'desk.settings.ticketRulesDetail.form.conditions.dropdown.placeholder',
                                      })}
                                      selectedItem={value}
                                      onChange={onChange}
                                      items={getConditionOperatorItems(index)}
                                      itemToString={(operator) => getOperatorLabel({ index, operator })}
                                      itemToElement={(operator) => getOperatorLabel({ index, operator })}
                                      onItemSelected={handleConditionOperatorItemSelected(index)}
                                    />
                                  );
                                }}
                              />
                            </ConditionColumn>
                            <ConditionColumn as="li">
                              <InputTransition isHidden={!field.key && !watchedConditions[index]?.key}>
                                <TicketRuleConditionValue
                                  key={`${field.key}.${field.value}`}
                                  control={control}
                                  index={index}
                                  defaultCondition={field as TicketRuleConditionForForm}
                                  currentConditionField={watchedConditions[index]}
                                  consequentType={watchedConsequentType}
                                  consequentAgent={consequentAgent}
                                  keyMap={keyMapRef.current}
                                  valueMap={valueMapRef.current}
                                  errors={errors}
                                  setError={setError}
                                  clearError={clearErrors}
                                  onValueDropdownSelected={handleConditionValueItemSelected(index)}
                                />
                              </InputTransition>
                              <InputTransition isHidden={conditionsFields.length <= 1}>
                                <RemoveConditionButton
                                  icon="remove"
                                  size="small"
                                  type="button"
                                  buttonType="tertiary"
                                  onClick={handleRemoveConditionClick(index)}
                                />
                              </InputTransition>
                            </ConditionColumn>
                          </ConditionRow>

                          {conditionsFields.length - 1 === index && (
                            <AddConditionButtonContainer>
                              <Tooltip
                                placement="top-start"
                                content={intl.formatMessage({
                                  id: 'desk.settings.ticketRulesDetail.form.button.add.tooltip.exceedMaximum',
                                })}
                                portalId="portal_tooltip"
                                disabled={conditionsFields.length < 10}
                              >
                                <AddButton
                                  icon="plus"
                                  type="button"
                                  buttonType="primary"
                                  variant="ghost"
                                  onClick={handleAppendConditionClick}
                                  disabled={conditionsFields.length >= 10}
                                >
                                  {intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.button.add' })}
                                </AddButton>
                              </Tooltip>
                            </AddConditionButtonContainer>
                          )}
                        </Fragment>
                      );
                    })}
                  </ConditionsContainer>
                </FormGroupContent>
              </FormGroup>
              <FormGroup>
                <FromGroupTitle>
                  {intl.formatMessage({
                    id: `desk.settings.${currentRuleType.intlKeyByType}Detail.form.consequent.title`,
                  })}
                </FromGroupTitle>
                <FormGroupContent>
                  {currentRuleType.type === TicketRuleType.ASSIGNMENT && (
                    <ConsequentItems>
                      <ConsequentItem>
                        <Controller
                          control={control}
                          name="conditional.consequent.type"
                          render={({ onChange, value, name }) => {
                            return (
                              <AssignmentConsequentTypeRadioGroup
                                name={name}
                                value={value}
                                disabled={isFetching}
                                onChange={(event) => {
                                  if (isTicketRuleConsequentType(event.target.value)) {
                                    handleAssignmentConsequentTypeChange(event.target.value);
                                    onChange(event.target.value);
                                  }
                                }}
                              />
                            );
                          }}
                        />
                        <Controller
                          defaultValue="id"
                          control={control}
                          name="conditional.consequent._group.key"
                          render={({ onChange, onBlur, value, name, ref }) => {
                            return (
                              <HiddenInputText
                                ref={ref}
                                name={name}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                              />
                            );
                          }}
                        />
                      </ConsequentItem>

                      {isWatchedConditionalConsequentGroupWithBotAgent && (
                        <ConsequentItem>
                          <InlineNotification
                            type="info"
                            message={intl.formatMessage({
                              id: 'desk.settings.assignmentRulesDetail.form.consequent.bot.info',
                            })}
                          />
                        </ConsequentItem>
                      )}

                      <ConsequentItem>
                        <Controller
                          control={control}
                          rules={{
                            required: intl.formatMessage({
                              id: `desk.settings.assignmentRulesDetail.form.consequent.value.error.required`,
                            }),
                          }}
                          name="conditional.consequent._group.value"
                          render={() => {
                            return (
                              <AgentGroupsSearchDropdown
                                selectedAgentGroup={selectedConsequentAgentGroup}
                                dropdownProps={{
                                  size: 'medium',
                                  variant: 'default',
                                  width: '100%',
                                }}
                                isBotOnly={watchedConsequentType === TicketRuleConsequentType.GROUP_WITH_BOT_AGENT}
                                hasError={
                                  !!(errors as DeepMap<TicketRuleFormData<TicketRuleConsequentGroupForm>, FieldError>)
                                    .conditional?.consequent?._group?.value
                                }
                                onItemSelected={handleAgentGroupDropdownItemSelected}
                              />
                            );
                          }}
                        />
                        {isWatchedConditionalConsequentGroupWithBotAgent && (
                          <>
                            <Controller
                              defaultValue="id"
                              control={control}
                              name="conditional.consequent._agent.key"
                              render={({ onChange, onBlur, value, name, ref }) => {
                                return (
                                  <HiddenInputText
                                    ref={ref}
                                    name={name}
                                    value={value}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                  />
                                );
                              }}
                            />
                            <Controller
                              name="conditional.consequent._agent.value"
                              control={control}
                              rules={{
                                required: intl.formatMessage({
                                  id: `desk.settings.assignmentRulesDetail.form.consequent.value.error.required`,
                                }),
                              }}
                              render={({ value }) => {
                                return (
                                  <AgentsSearchDropdown
                                    selectedAgentId={value}
                                    placeholder={intl.formatMessage({
                                      id: 'desk.agentSelect.dropdown.item.placeholder.select.botAgent',
                                    })}
                                    selectedAgentGroup={selectedConsequentAgentGroup ?? undefined}
                                    agentType={AgentType.BOT}
                                    isToggleFullWidth={true}
                                    isAgentGroupDropdownHidden={true}
                                    isSearchHidden={true}
                                    dropdownProps={{
                                      size: 'medium',
                                      variant: 'default',
                                      width: '100%',
                                    }}
                                    disabled={!selectedConsequentAgentGroup}
                                    hasError={
                                      !!(errors as DeepMap<
                                        TicketRuleFormData<TicketRuleConsequentGroupWithBotAgentForm>,
                                        FieldError
                                      >)?.conditional?.consequent?._agent?.value
                                    }
                                    styles={{ marginTop: 8 }}
                                    onItemSelected={handleAgentDropdownItemSelected}
                                  />
                                );
                              }}
                            />
                          </>
                        )}
                      </ConsequentItem>
                    </ConsequentItems>
                  )}
                  {currentRuleType.type === TicketRuleType.PRIORITY && (
                    <>
                      <Controller
                        defaultValue={TicketRuleConsequentType.PRIORITY}
                        control={control}
                        name="conditional.consequent.type"
                        render={({ onChange, onBlur, value, name, ref }) => {
                          return (
                            <HiddenInputText ref={ref} name={name} value={value} onChange={onChange} onBlur={onBlur} />
                          );
                        }}
                      />
                      <Controller
                        defaultValue="priority"
                        control={control}
                        name="conditional.consequent._priority.key"
                        render={({ onChange, onBlur, value, name, ref }) => {
                          return (
                            <HiddenInputText ref={ref} name={name} value={value} onChange={onChange} onBlur={onBlur} />
                          );
                        }}
                      />
                      <Controller
                        control={control}
                        rules={{
                          required: intl.formatMessage({
                            id: `desk.settings.priorityRulesDetail.form.consequent.value.error.required`,
                          }),
                        }}
                        name="conditional.consequent._priority.value"
                        defaultValue={TicketPriority.MEDIUM}
                        render={({ onChange, value }) => {
                          return (
                            <PriorityRadioGroup
                              value={value}
                              onChange={onChange}
                              hasError={
                                !!(errors as DeepMap<TicketRuleFormData<TicketRuleConsequentPriorityForm>, FieldError>)
                                  ?.conditional?.consequent?._priority?.value
                              }
                              disabled={isFetching}
                            />
                          );
                        }}
                      />
                    </>
                  )}
                </FormGroupContent>
              </FormGroup>
              <SlideTransition
                show={inlineNotificationError.isRender}
                from="bottom"
                css={css`
                  display: flex;
                  flex: 1;
                  align-items: flex-end;
                `}
              >
                <InlineNotification
                  data-test-id="RuleErrorNotification"
                  {...inlineNotificationError}
                  css={css`
                    width: 100%;
                  `}
                />
              </SlideTransition>
            </Form>
          </ScrollBar>
        </FormContainer>
        <Item>
          {isEdit && (
            <DeleteButton
              icon="delete"
              type="button"
              buttonType="primary"
              variant="ghost"
              disabled={isFetching}
              onClick={handleDeleteClick}
            >
              {intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.button.delete' })}
            </DeleteButton>
          )}
        </Item>
        <Item justifySelf="end" data-test-id="FormActionContainer">
          <CancelButton
            type="button"
            buttonType="tertiary"
            role="button"
            disabled={isFetching}
            onClick={handleDrawerCloseClick}
          >
            {intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.button.cancel' })}
          </CancelButton>
          <Button
            buttonType="primary"
            type="submit"
            role="button"
            form={FORM_ID}
            disabled={!isFormSubmittable || isFetching}
            onClick={handleSubmit(onSubmit)}
          >
            {intl.formatMessage({ id: 'desk.settings.ticketRulesDetail.form.button.save' })}
          </Button>
        </Item>
      </Grid>
    </RuleDrawer>
  );
});
