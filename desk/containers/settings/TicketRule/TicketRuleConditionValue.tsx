import { memo, useEffect, useMemo, useRef } from 'react';
import { Control, Controller, FieldError, FieldErrors, UseFormMethods, Validate } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, InputText, Dropdown, DropdownProps, Icon, transitionDefault } from 'feather';

import { DeskBotType } from '@constants/desk';
import { TextWithOverflowTooltip } from '@ui/components';

import {
  TicketRuleConditionType,
  ticketChannelTypeItems,
  ticketChannelTypeLabel,
  ticketChannelKeyItem,
  customerUserIdKeyItem,
  customerUserNameKeyItem,
  TicketChannelTypeValue,
  facebookTicketChannelTypes,
  twitterTicketChannelTypes,
  instagramTicketChannelTypes,
  whatsappTicketChannelTypes,
  ticketChannelTypesForCustomBotItems,
  noValueOperators,
  TicketRuleConsequentType,
  TicketRuleConditionErrorType,
  inAppTicketChannelTypes,
  TicketRuleConditionErrorMessage,
} from './constants';

const ToggleOverflowText = styled(TextWithOverflowTooltip)`
  margin-left: 16px;
  max-width: 156px;
  font-weight: 500;
`;

const ValueOptionText = styled(TextWithOverflowTooltip)`
  max-width: 280px;
  font-weight: 500;
`;

const TicketChannelTypeLabel = styled.span<{ isParent: boolean }>`
  padding-left: ${({ isParent }) => (isParent ? 0 : 16)}px;
  font-weight: ${({ isParent }) => (isParent ? 500 : 400)};
`;

const SelectedTicketChannelTypeLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const ChannelIcon = styled(Icon)`
  margin-right: 8px;
  margin-left: 12px;
`;

const HiddenInputText = styled(InputText)`
  width: 0;
  height: 0;
  margin: 0;
  overflow: hidden;
  pointer-events: none;

  & + & {
    margin: 0;
  }
`;

const NUMBER_REGEX = new RegExp(/^[0-9]+$/);

const parentTicketChannelTypes = [
  TicketChannelTypeValue.INAPP,
  TicketChannelTypeValue.FACEBOOK,
  TicketChannelTypeValue.TWITTER,
  TicketChannelTypeValue.INSTAGRAM,
  TicketChannelTypeValue.WHATSAPP,
];

type Props = {
  index: number;
  currentConditionField: TicketRuleConditionForForm;
  defaultCondition: TicketRuleConditionForForm;
  consequentType: TicketRuleConsequentType;
  consequentAgent?: Agent;
  keyMap: Map<string, TicketRuleConditionForKeyMap>;
  valueMap: Map<string, CustomField['options']>;
  control: Control<TicketRuleFormData>;
  errors: FieldErrors<TicketRuleFormData>;
  setError: UseFormMethods<TicketRuleFormData>['setError'];
  clearError: UseFormMethods<TicketRuleFormData>['clearErrors'];
  onValueDropdownSelected: () => void;
};

const ValueDropdown = (props: DropdownProps<TicketRuleCondition['value']>) => (
  <Dropdown<TicketRuleConditionForForm['value']>
    css={css`
      svg {
        transition: fill 0.2s ${transitionDefault};
      }

      &:hover:enabled {
        svg {
          fill: ${cssVariables('purple-7')};
        }
      }
    `}
    {...props}
  />
);

const errorProcessor = (error: FieldError | undefined) => {
  return error?.message
    ? {
        hasError: true,
        message: typeof error.message === 'string' ? error.message : '',
      }
    : undefined;
};

export const TicketRuleConditionValue = memo<Props>(
  ({
    index,
    defaultCondition,
    currentConditionField,
    consequentType,
    consequentAgent,
    keyMap,
    valueMap,
    control,
    errors,
    setError,
    clearError,
    onValueDropdownSelected,
  }) => {
    const intl = useIntl();

    const fieldKey = currentConditionField?.key ?? defaultCondition.key;
    const fieldType = (!!fieldKey && keyMap.get(fieldKey)?.type) ?? TicketRuleConditionType.DROPDOWN;
    const fieldOperator = currentConditionField?.operator ?? defaultCondition.operator;
    const defaultValueRef = useRef(defaultCondition.value);

    const splitKey = fieldKey?.split('.');
    const isCustomField =
      !!splitKey && splitKey.length === 3 && (splitKey[0] === 'ticket_field' || splitKey[0] === 'customer_field');
    const customFieldKeyPrefix = isCustomField && !!splitKey ? splitKey[0] : undefined;
    const customFieldKey = isCustomField && !!splitKey ? splitKey[2] : undefined;
    const customFieldOptions =
      customFieldKey && customFieldKeyPrefix
        ? valueMap.get(`${customFieldKeyPrefix}.key.${customFieldKey}`)
        : undefined;

    const isTextType = fieldType === TicketRuleConditionType.TEXT;
    const isNumberType = fieldType === TicketRuleConditionType.NUMBER;
    const isDropdownType = fieldType === TicketRuleConditionType.DROPDOWN;

    // error should reset if current value is null
    const error = currentConditionField?.value == null ? undefined : errors?.conditional?.conditions?.[index]?.value;

    const isNoError = error === undefined;
    const isConsequentTypeSetAsBot = consequentType === TicketRuleConsequentType.GROUP_WITH_BOT_AGENT;
    const isConsequentAgentCustomBot = consequentAgent?.bot?.type === DeskBotType.CUSTOMIZED;
    const isConsequentAgentFAQBot = consequentAgent?.bot?.type === DeskBotType.FAQBOT;

    const isInvalidChannelForCustomBot =
      isConsequentAgentCustomBot &&
      currentConditionField?.value &&
      ticketChannelTypesForCustomBotItems.every(
        (channelAllowedToCustomBot) =>
          channelAllowedToCustomBot !== (currentConditionField.value as TicketChannelTypeValue),
      );

    const isInvalidChannelForFAQBot =
      isConsequentAgentFAQBot &&
      currentConditionField?.value &&
      inAppTicketChannelTypes.every(
        (channelAllowedToFAQBot) => channelAllowedToFAQBot !== (currentConditionField.value as TicketChannelTypeValue),
      );

    const isSelectedValidChannelType =
      currentConditionField?.value &&
      ticketChannelTypeItems.includes(currentConditionField.value as TicketChannelTypeValue);

    const name = `conditional.conditions[${index}].value`;
    const isTicketChannel = fieldKey === ticketChannelKeyItem.key;

    const isNoValueOperator = noValueOperators.includes(fieldOperator);

    /**
     * @property defaultValueRef
     * defaultValueRef passed to defaultValue prop on both ValueDropdown and ValueInput.
     * When key is updated, currentConditionField.value will be null and therefore the defaultValue for each component should be set as null
     */
    useEffect(() => {
      defaultValueRef.current = currentConditionField?.value ?? null;
    }, [currentConditionField]);

    useEffect(() => {
      if (isTicketChannel) {
        /**
         * @error
         * If consequent values are updated and condition value become invalid due to its dependency,
         * @method setError will set error
         */
        if (isConsequentTypeSetAsBot && (isInvalidChannelForCustomBot || isInvalidChannelForFAQBot)) {
          const errorMessage = (() => {
            if (isInvalidChannelForCustomBot) {
              return TicketRuleConditionErrorMessage.INVALID_CHANNEL_BY_CONSEQUENT_CUSTOM_BOT;
            }

            if (isInvalidChannelForFAQBot) {
              return TicketRuleConditionErrorMessage.INVALID_CHANNEL_BY_CONSEQUENT_FAQ_BOT;
            }

            return TicketRuleConditionErrorMessage.INVALID_CHANNEL_BY_UNKNOWN_REASON;
          })();

          if (errors.conditional?.conditions?.[index]?.value?.message !== errorMessage) {
            setError(name, { type: TicketRuleConditionErrorType.VALUE, message: errorMessage });
          }
          return;
        }

        if (!isNoError && !isConsequentTypeSetAsBot && isSelectedValidChannelType) {
          clearError(name);
          return;
        }
      }
    }, [
      clearError,
      errors,
      index,
      isConsequentTypeSetAsBot,
      isInvalidChannelForCustomBot,
      isInvalidChannelForFAQBot,
      isNoError,
      isSelectedValidChannelType,
      isTicketChannel,
      name,
      setError,
    ]);

    const getItemString = (item: TicketRuleConditionForForm['value']): string => item || '';

    const isDropdownItemDisabled: DropdownProps<TicketRuleCondition['value']>['isItemDisabled'] = useMemo(() => {
      if (isTicketChannel && isConsequentTypeSetAsBot && isConsequentAgentCustomBot) {
        return (channelType: TicketChannelTypeValue) => !ticketChannelTypesForCustomBotItems.includes(channelType);
      }

      if (isTicketChannel && isConsequentTypeSetAsBot && isConsequentAgentFAQBot) {
        return (channelType: TicketChannelTypeValue) => !inAppTicketChannelTypes.includes(channelType);
      }

      return undefined;
    }, [isConsequentAgentCustomBot, isConsequentAgentFAQBot, isConsequentTypeSetAsBot, isTicketChannel]);

    if (!!fieldKey && !isNoValueOperator && (isTextType || isNumberType)) {
      const maximumLength =
        fieldKey === customerUserIdKeyItem.key || fieldKey === customerUserNameKeyItem.key ? 100 : 190;
      const requiredValue = (value: string | null) =>
        value?.trim().length === 0
          ? intl.formatMessage({
              id: 'desk.settings.ticketRulesDetail.form.conditions.value.textNumber.error.required',
            })
          : undefined;
      const onlyNumber = (value: string | null) =>
        value && NUMBER_REGEX.test(value)
          ? undefined
          : intl.formatMessage({
              id: 'desk.settings.ticketRulesDetail.form.conditions.value.number.error.onlyNumber',
            });
      const maximum = (value: string | null) =>
        value && value.length > maximumLength
          ? intl.formatMessage(
              { id: 'desk.settings.ticketRulesDetail.form.conditions.value.error.maximum' },
              { max: maximumLength },
            )
          : undefined;

      const validate: Record<string, Validate> = isNumberType
        ? {
            requiredValue,
            maximum,
            onlyNumber,
          }
        : { requiredValue, maximum };

      return (
        <Controller
          key={`TextOrNumberValue-${fieldKey}-${index}`}
          control={control}
          name={name}
          defaultValue={defaultValueRef.current}
          rules={{
            required: intl.formatMessage({
              id: 'desk.settings.ticketRulesDetail.form.conditions.value.textNumber.error.required',
            }),
            validate,
          }}
          render={({ onChange, onBlur, value, name, ref }) => {
            return (
              <InputText
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                name={name}
                ref={ref}
                error={error && errorProcessor(error)}
              />
            );
          }}
        />
      );
    }

    if (!!fieldKey && !isNoValueOperator && isDropdownType) {
      const valueItems = isTicketChannel ? ticketChannelTypeItems : (customFieldOptions as string[]);

      const isTicketChannelItems = (value: TicketRuleConditionForForm['value']) =>
        ticketChannelTypeItems.includes(value as TicketChannelTypeValue);

      const getTicketChannelTypeValueText = (value: TicketRuleConditionForForm['value']) =>
        isTicketChannelItems(value) ? intl.formatMessage({ id: ticketChannelTypeLabel[value as string] }) : '';

      const getTicketChannelTypeIcon = (value: TicketRuleConditionForForm['value'] | TicketChannelTypeValue) => {
        if (facebookTicketChannelTypes.includes(value as TicketChannelTypeValue)) {
          return 'facebook';
        }

        if (twitterTicketChannelTypes.includes(value as TicketChannelTypeValue)) {
          return 'twitter';
        }

        if (instagramTicketChannelTypes.includes(value as TicketChannelTypeValue)) {
          return 'instagram';
        }

        if (whatsappTicketChannelTypes.includes(value as TicketChannelTypeValue)) {
          return 'whatsapp';
        }

        return 'mobile-application';
      };

      const itemToString: DropdownProps<TicketRuleConditionForForm['value']>['itemToString'] = (value) =>
        value && isTicketChannelItems(value) ? getTicketChannelTypeValueText(value) : getItemString(value);
      const itemToElement: DropdownProps<TicketRuleConditionForForm['value']>['itemToElement'] = (value) =>
        value && isTicketChannelItems(value) ? (
          <TicketChannelTypeLabel isParent={parentTicketChannelTypes.includes(value as TicketChannelTypeValue)}>
            {getTicketChannelTypeValueText(value)}
          </TicketChannelTypeLabel>
        ) : (
          <ValueOptionText>{value}</ValueOptionText>
        );

      const toggleRenderer: DropdownProps<TicketRuleConditionForForm['value']>['toggleRenderer'] = ({
        isOpen,
        selectedItem: selectedValue,
      }) => {
        if (selectedValue && isTicketChannelItems(selectedValue)) {
          return (
            <>
              <ChannelIcon
                icon={getTicketChannelTypeIcon(selectedValue)}
                color={isOpen ? cssVariables('purple-7') : cssVariables('neutral-10')}
                size={20}
              />
              <SelectedTicketChannelTypeLabel>
                {getTicketChannelTypeValueText(selectedValue)}
              </SelectedTicketChannelTypeLabel>
            </>
          );
        }

        return <ToggleOverflowText>{selectedValue}</ToggleOverflowText>;
      };

      return (
        <Controller
          key={`DropdownValue-${fieldKey}-${index}`}
          control={control}
          rules={{
            required: intl.formatMessage({
              id: 'desk.settings.ticketRulesDetail.form.conditions.value.textNumber.error.required',
            }),
          }}
          name={name}
          defaultValue={defaultValueRef.current}
          render={({ onChange, value, ref }) => {
            return (
              <ValueDropdown
                ref={ref}
                selectedItem={value}
                onChange={onChange}
                portalId="portal_popup"
                placeholder={intl.formatMessage({
                  id: 'desk.settings.ticketRulesDetail.form.conditions.dropdown.placeholder',
                })}
                items={valueItems}
                itemToString={itemToString}
                itemToElement={itemToElement}
                isItemDisabled={isDropdownItemDisabled}
                toggleRenderer={currentConditionField?.value ? toggleRenderer : undefined}
                hasError={!!error}
                onItemSelected={onValueDropdownSelected}
              />
            );
          }}
        />
      );
    }

    return (
      <Controller
        key={`NullValue-${fieldKey}-${index}`}
        defaultValue={null}
        control={control}
        name={name}
        render={({ onChange, onBlur, value, name, ref }) => {
          return (
            <HiddenInputText type="hidden" onChange={onChange} onBlur={onBlur} value={value} name={name} ref={ref} />
          );
        }}
      />
    );
  },
);
