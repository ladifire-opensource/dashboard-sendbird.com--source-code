import React, { useMemo, useCallback, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import styled from 'styled-components';

import { Checkbox, useForm, useField, Field, cssVariables, Lozenge, LozengeVariant } from 'feather';

import { coreActions } from '@actions';
import { SettingsGridCard, SettingsDescriptionText } from '@common/containers/layout/settingsGrid';
import { Unsaved } from '@hooks';

type CheckboxField = Field<boolean, HTMLInputElement>;

interface Fields {
  CHANNEL_CREATE: {
    PRIVATE_CHANNEL: CheckboxField | undefined;
    PUBLIC_CHANNEL: CheckboxField | undefined;
  };
  USER_JOIN: {
    USER_JOIN: CheckboxField | undefined;
  };
  USER_LEAVE: {
    DEACTIVATED: CheckboxField | undefined;
    DELETED: CheckboxField | undefined;
    LEFT: CheckboxField | undefined;
    ADMIN_REMOVED: CheckboxField | undefined;
    ADMIN_DELETED: CheckboxField | undefined;
    ADMIN_DEACTIVATED: CheckboxField | undefined;
    LEFT_BY_OWN_CHOICE: CheckboxField | undefined;
    CHANNEL_OPERATOR_REMOVED: CheckboxField | undefined;
  };
  CHANNEL_CHANGE: {
    CHANNEL_CHANGE: CheckboxField | undefined;
  };
}

type Props = {
  application: Application;
  isFetchingAutoEventMessage: SettingsState['isFetchingAutoEventMessage'];
  isEditable: boolean;
  setUnsaved: Unsaved['setUnsaved'];
  updateAutoEventMessageRequest: (...args: Parameters<typeof coreActions.updateAutoEventMessageRequest>) => void;
};

const autoMessageIntlKeys = {
  CHANNEL_CREATE: 'core.settings.application.message.autoMessage.channel_created',
  PRIVATE_CHANNEL: 'core.settings.application.message.autoMessage.channel_private',
  PUBLIC_CHANNEL: 'core.settings.application.message.autoMessage.channel_public',

  USER_JOIN: 'core.settings.application.message.autoMessage.user_joins',

  USER_LEAVE: 'core.settings.application.message.autoMessage.user_leaves',
  DEACTIVATED: 'core.settings.application.message.autoMessage.user_leaves.byAdmin_deactivate',
  DELETED: 'core.settings.application.message.autoMessage.user_leaves.byAdmin_delete',
  LEFT: 'core.settings.application.message.autoMessage.user_leaves.bySelf',
  LEFT_BY_OWN_CHOICE: 'core.settings.application.message.autoMessage.user_leaves.bySelf',
  CHANNEL_OPERATOR_REMOVED: 'core.settings.application.message.autoMessage.user_leaves.byOperator_remove',
  ADMIN_REMOVED: 'core.settings.application.message.autoMessage.user_leaves.byAdmin_ban',
  ADMIN_DELETED: 'core.settings.application.message.autoMessage.user_leaves.byAdmin_delete',
  ADMIN_DEACTIVATED: 'core.settings.application.message.autoMessage.user_leaves.byAdmin_deactivate',

  CHANNEL_CHANGE: 'core.settings.application.message.autoMessage.property_changed',
};

// this is a temporary fix code for the Dream11
const newEventKeys = [
  'LEFT_BY_OWN_CHOICE',
  'ADMIN_REMOVED',
  'ADMIN_DELETED',
  'ADMIN_DEACTIVATED',
  'CHANNEL_OPERATOR_REMOVED',
];

const OptionsContainer = styled.ul`
  padding: 11px 0;
  list-style: none;

  & + & {
    border-top: 1px solid ${cssVariables('neutral-3')};
  }

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }
`;

const OptionList = styled.li`
  display: flex;
  align-items: center;
  margin-left: 24px;
  padding: 5px 0;

  label {
    font-weight: 400 !important;

    b {
      font-weight: 600 !important;
    }
  }

  &:first-child {
    margin-left: 0;

    label {
      font-weight: 500 !important;
    }
  }

  ${Lozenge} {
    margin-left: 8px;
  }
`;

export const AutoMessage = React.memo<Props>(
  ({ application, isFetchingAutoEventMessage, isEditable, setUnsaved, updateAutoEventMessageRequest }) => {
    const intl = useIntl();
    const { auto_event_message } = application.attrs;
    const form = useForm({
      onSubmit: ({
        PRIVATE_CHANNEL,
        PUBLIC_CHANNEL,
        USER_JOIN,
        DEACTIVATED,
        DELETED,
        LEFT,
        ADMIN_DELETED,
        ADMIN_DEACTIVATED,
        ADMIN_REMOVED,
        LEFT_BY_OWN_CHOICE,
        CHANNEL_OPERATOR_REMOVED,
        CHANNEL_CHANGE,
      }) => {
        updateAutoEventMessageRequest({
          auto_event_message: {
            CHANNEL_CHANGE: { CHANNEL_CHANGE },
            CHANNEL_CREATE: { PUBLIC_CHANNEL, PRIVATE_CHANNEL },
            USER_JOIN: { USER_JOIN },
            USER_LEAVE: {
              DELETED,
              DEACTIVATED,
              LEFT,
              ADMIN_DELETED,
              ADMIN_DEACTIVATED,
              ADMIN_REMOVED,
              LEFT_BY_OWN_CHOICE,
              CHANNEL_OPERATOR_REMOVED,
            },
          },
          onSuccess: form.onSuccess,
        });
      },
    });

    const fields: Fields = {
      CHANNEL_CHANGE: { CHANNEL_CHANGE: undefined },
      CHANNEL_CREATE: { PUBLIC_CHANNEL: undefined, PRIVATE_CHANNEL: undefined },
      USER_JOIN: { USER_JOIN: undefined },
      USER_LEAVE: {
        DELETED: undefined,
        DEACTIVATED: undefined,
        LEFT: undefined,
        ADMIN_DELETED: undefined,
        ADMIN_DEACTIVATED: undefined,
        ADMIN_REMOVED: undefined,
        LEFT_BY_OWN_CHOICE: undefined,
        CHANNEL_OPERATOR_REMOVED: undefined,
      },
    };

    Object.entries(auto_event_message)
      .filter(([key]) => key in autoMessageIntlKeys)
      .sort()
      .forEach(([groupKey, options]) =>
        Object.keys(options).forEach((optionKey) => {
          // FIXME: react-hooks/rules-of-hooks violation
          // eslint-disable-next-line react-hooks/rules-of-hooks
          fields[groupKey][optionKey] = useField(optionKey, form, {
            defaultValue: options[optionKey],
            isControlled: true,
          });
        }),
      );

    const renderOptions = () =>
      Object.entries(fields).map(([groupKey, optionFields]) => {
        let allChecked = false;
        let allunChecked = false;
        let indeterminate = false;

        Object.entries(optionFields)
          .sort()
          .reduce((optionValues: boolean[], [, optionField]: [string, CheckboxField | undefined]) => {
            optionValues.push(optionField?.value || false);
            optionValues.every((value) => value) ? (allChecked = true) : (allChecked = false);
            optionValues.every((value) => !value) ? (allunChecked = true) : (allunChecked = false);
            optionValues.some((value) => !value) && !allunChecked && !allChecked
              ? (indeterminate = true)
              : (indeterminate = false);

            return optionValues;
          }, []);

        // FIXME: react-hooks/rules-of-hooks violation
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const hanleCheckAllClick = useCallback(() => {
          Object.entries(optionFields)
            .filter(([, value]) => !!value)
            .sort()
            .forEach(([, optionField]: [string, CheckboxField]) => optionField.updateValue(!allChecked));
        }, [optionFields, allChecked]);

        const handleCheckClick = (field: CheckboxField) => () => {
          field.updateValue(!field.value);
        };

        return (
          <OptionsContainer key={groupKey}>
            {Object.keys(optionFields).length > 1
              ? // FIXME: react-hooks/rules-of-hooks violation
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useMemo(
                  () => (
                    <OptionList key={`option-group-${groupKey}`}>
                      <Checkbox
                        checked={allChecked}
                        name={groupKey}
                        indeterminate={indeterminate}
                        label={intl.formatMessage({ id: autoMessageIntlKeys[groupKey] })}
                        onChange={hanleCheckAllClick}
                        disabled={!isEditable}
                      />
                    </OptionList>
                  ),
                  [allChecked, indeterminate, groupKey, hanleCheckAllClick],
                )
              : null}
            {Object.entries(optionFields)
              .filter(([, value]) => !!value)
              .sort()
              .map(([optionKey, optionField]: [string, CheckboxField]) =>
                // FIXME: react-hooks/rules-of-hooks violation
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useMemo(
                  () => (
                    <OptionList key={`option-sub-${optionKey}`}>
                      <Checkbox
                        checked={optionField.value}
                        name={optionField.name}
                        label={intl.formatMessage({ id: autoMessageIntlKeys[optionKey] })}
                        onChange={handleCheckClick(optionField)}
                        disabled={!isEditable}
                      />
                      {newEventKeys.includes(optionKey) && (
                        <Lozenge color="purple" variant={LozengeVariant.Light}>
                          NEW
                        </Lozenge>
                      )}
                    </OptionList>
                  ),
                  [optionKey, optionField],
                ),
              )}
          </OptionsContainer>
        );
      });

    const onSaveButtonClick = useCallback((e) => form.onSubmit(e), [form]);
    const onFormInputTriggerSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
      (e) => {
        e.preventDefault();
        form.onSubmit(e);
      },
      [form],
    );

    let showActions = false;
    Object.entries(fields)
      .sort()
      .forEach(([, optionFields]) =>
        Object.entries(optionFields)
          .filter(([, value]) => !!value)
          .sort()
          .reduce((updatables: boolean[], [, option]: [string, CheckboxField]) => {
            if (option && option.updatable) {
              updatables.push(option.updatable);
            }
            updatables.some((updatable) => updatable) && (showActions = true);
            return updatables;
          }, []),
      );

    const updatables = Object.entries(fields)
      .map(([, optionFields]) =>
        Object.entries(optionFields)
          .filter(([, value]) => !!value)
          .map(([, field]: [string, CheckboxField]) => field.updatable),
      )
      .reduce((acc, currFields) => {
        currFields.forEach((curr) => acc.push(curr));
        return acc;
      }, []);

    useEffect(() => {
      setUnsaved(updatables.some((updatable) => updatable));
    }, [setUnsaved, updatables]);

    return (
      <SettingsGridCard
        title={intl.formatMessage({ id: 'core.settings.application.message.autoMessage.title' })}
        description={
          <>
            <SettingsDescriptionText display="block">
              {intl.formatMessage({ id: 'core.settings.application.message.autoMessage.desc' })}
            </SettingsDescriptionText>
            <SettingsDescriptionText display="block" fontSize={12}>
              <FormattedMessage
                id="core.settings.application.message.autoMessage.desc_sub"
                values={{ data: <b>data</b> }}
              />
            </SettingsDescriptionText>
          </>
        }
        gridItemConfig={{
          subject: {
            alignSelf: 'start',
          },
        }}
        showActions={showActions}
        actions={[
          {
            key: 'auto-message-cancel',
            label: intl.formatMessage({ id: 'label.cancel' }),
            buttonType: 'tertiary',
            onClick: form.reset,
          },
          {
            key: 'auto-message-save',
            label: intl.formatMessage({ id: 'label.save' }),
            buttonType: 'primary',
            onClick: onSaveButtonClick,
            isLoading: isFetchingAutoEventMessage,
            disabled: isFetchingAutoEventMessage || !isEditable,
          },
        ]}
      >
        <form onSubmit={onFormInputTriggerSubmit}>{renderOptions()}</form>
      </SettingsGridCard>
    );
  },
);
