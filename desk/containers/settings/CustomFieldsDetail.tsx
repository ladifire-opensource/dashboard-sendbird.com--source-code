import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { cssVariables, Button, OverflowMenu, Dropdown } from 'feather';
import countBy from 'lodash/countBy';
import debounce from 'lodash/debounce';
import moment from 'moment-timezone';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsCard, SettingsCardGroup, AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { useForm, useField, useShowDialog } from '@hooks';
import { InputRadio, makeGrid, FormInput } from '@ui/components';

import { DragContainer } from './draggable/dragContainer';

const ActionBeforeNode = styled.div``;
const { wideGridMediaQuery } = makeGrid({
  wideGutterSize: 24,
  narrowGutterSize: 20,
  columns: 8,
});

const SettingsSection = styled(SettingsCard)`
  border: none;

  & + & {
    border-top: 1px solid ${cssVariables('neutral-3')};
  }
`;

const DropdownSection = styled(SettingsSection)`
  border-bottom: 2px solid ${cssVariables('neutral-3')};

  > div {
    display: flex;
    align-items: flex-start;
  }

  h6 {
    padding-top: 10px;
  }
`;

export const SettingsCardFooter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 64px;
  background-color: ${cssVariables('neutral-1')};
  overflow: hidden;
  padding: 0 20px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;

  ${wideGridMediaQuery`
  padding: 0 24px;
  `}

  > ${ActionBeforeNode} {
    margin-right: auto;
  }

  > button {
    min-width: 96px;
    justify-content: center;
  }

  > button + button {
    margin-left: 12px;
  }
`;

const Container = styled(SettingsCardGroup)`
  margin-top: 16px;
  border-radius: 4px;
  border: 1px solid ${cssVariables('neutral-3')};
`;

const LastUpdateBar = styled.div`
  font-size: 14px;
  color: ${cssVariables('neutral-6')};
`;

const TitleOverflowMenu = styled(OverflowMenu)`
  margin-left: 8px;
`;

const DropDownContainer = styled.div`
  margin-top: 16px;

  &::before {
    content: ' ';
    display: block;
    width: 100%;
    height: 1px;
    background: ${cssVariables('neutral-3')};
  }
`;

type Props = {
  /**
   * Note that name will be used for back button URL and to get the title of create-mode form.
   * i.e. when name is `ticket`, back button URL is `/desk/settings/ticket-fields`
   */
  name: 'ticket' | 'customer';
  customFields: CustomFieldsState;
  editingFieldId?: number;

  createField: (payload: any) => void;
  updateField: (payload: any) => void;
  deleteField: (id: any) => void;
  checkFieldKeyValidation: (payload: any) => void;
  setCheckingStatusFieldKeyValidation: (payload: any) => void;
};

type CustomFieldTypeItemKey = 'STRING' | 'INTEGER' | 'DROPDOWN' | 'LINK';
const customFieldTypeItems: CustomFieldTypeItemKey[] = ['STRING', 'INTEGER', 'DROPDOWN', 'LINK'];

const fieldNameTitle = {
  ticket: 'desk.customFields.detail.field.ticket.title',
  customer: 'desk.customFields.detail.field.customer.title',
};

const dataTypeDropdownLabels = {
  STRING: 'desk.customFields.detail.field.fieldType.item.text',
  INTEGER: 'desk.customFields.detail.field.fieldType.item.integer',
  DROPDOWN: 'desk.customFields.detail.field.fieldType.item.dropdown',
  LINK: 'desk.customFields.detail.field.fieldType.item.link',
};

export const CustomFieldsDetail = React.memo<Props>(
  ({
    name,
    customFields,
    editingFieldId,
    createField,
    updateField,
    deleteField,
    checkFieldKeyValidation,
    setCheckingStatusFieldKeyValidation,
  }) => {
    const intl = useIntl();
    const history = useHistory();
    const showDialog = useShowDialog();
    const isEditMode = typeof editingFieldId === 'number';

    const appId = useSelector((state: RootState) => state.applicationState.data?.app_id);

    const { selectedCustomField } = customFields;
    const defaultCustomFieldType = customFieldTypeItems[0];
    const [customFieldType, setCustomFieldType] = useState<CustomFieldTypeItemKey>(defaultCustomFieldType);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [dropdownField, setDropdownField] = useState<CustomFieldDropdownValue>({
      fields: {},
      order: [],
    });
    const isFirstKeyValidateRun = useRef(true);

    const getFieldValues = useCallback(() => {
      const { order, fields } = dropdownField;
      return order.map((key) => fields[key].value.trim());
    }, [dropdownField]);

    const customFieldsForm = useForm({
      onSubmit: (data) => {
        const fieldValues = getFieldValues();
        if (isEditMode) {
          updateField({
            ...data,
            id: selectedCustomField?.id,
            readOnly: isReadOnly,
            fieldType: customFieldType,
            options: customFieldType === 'DROPDOWN' && fieldValues,
          });
        } else {
          createField({
            ...data,
            readOnly: isReadOnly,
            fieldType: customFieldType,
            options: customFieldType === 'DROPDOWN' && fieldValues,
          });
        }
      },
    });

    const labelField = useField<string>('label', customFieldsForm, {
      defaultValue: '',
      placeholder: '',
      validate: (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
          return intl.formatMessage({ id: 'desk.customFields.detail.field.label.error.minimum' });
        }
        if (trimmedValue.length > 20) {
          return intl.formatMessage({ id: 'desk.customFields.detail.field.label.error.maximum' });
        }
        return '';
      },
    });

    const keyField = useField<string>('key', customFieldsForm, {
      defaultValue: '',
      placeholder: '',
      validate: (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
          return intl.formatMessage({ id: 'desk.customFields.detail.field.key.error.minimum' });
        }
        if (trimmedValue.length > 20) {
          return intl.formatMessage({ id: 'desk.customFields.detail.field.key.error.maximum' });
        }
        if (!/^[a-z0-9-]*$/.test(trimmedValue)) {
          return intl.formatMessage({ id: 'desk.customFields.detail.field.key.error.allowed' });
        }
        if (!/[a-z0-9]/.test(trimmedValue.charAt(0))) {
          return intl.formatMessage({ id: 'desk.customFields.detail.field.key.error.start' });
        }
        return '';
      },
    });

    const descriptionField = useField<string>('description', customFieldsForm, {
      defaultValue: '',
      placeholder: intl.formatMessage({ id: 'desk.customFields.detail.ph.field.description' }),
      validate: (value) => {
        const trimmedValue = value.trim();
        if (trimmedValue.length > 200) {
          return intl.formatMessage({ id: 'desk.customFields.detail.field.description.error.maximum' });
        }
        return '';
      },
    });

    const backUrl = `/${appId}/desk/settings/${name}-fields`;

    const goToSettings = useCallback(() => history.push(backUrl), [history, backUrl]);

    const handlePermissionFieldChange = useCallback(
      (value) => () => {
        setIsReadOnly(value);
      },
      [],
    );

    const checkEmptyDropdownField = useCallback(() => {
      const { fields } = dropdownField;
      const copiedDropdownFields = { ...fields };
      const keys = Object.keys(fields);
      keys.forEach((key) => {
        if (fields[key].value.trim() === '') {
          if (keys.length === 1) {
            copiedDropdownFields[key].error = {
              hasError: true,
              message: intl.formatMessage({ id: 'desk.customFields.detail.field.dropdown.error.noOption' }),
            };
          } else {
            copiedDropdownFields[key].error = {
              hasError: true,
              message: intl.formatMessage({ id: 'desk.customFields.detail.field.dropdown.error.emptyOption' }),
            };
          }
        }
      });

      setDropdownField({
        ...dropdownField,
        fields: copiedDropdownFields,
      });
    }, [dropdownField, intl]);

    const onFormInputTriggerSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (customFieldType === 'DROPDOWN') {
          const { fields } = dropdownField;
          const fieldValues = getFieldValues();
          const hasError = [
            ...Object.values(fields).map((field) => field.error.hasError),
            ...fieldValues.map((fieldValue) => fieldValue.trim() === ''),
          ].some((hasError) => hasError);

          checkEmptyDropdownField();

          if (!hasError) {
            customFieldsForm.onSubmit();
          }
        } else {
          customFieldsForm.onSubmit();
        }
      },
      [checkEmptyDropdownField, customFieldType, customFieldsForm, dropdownField, getFieldValues],
    );

    const handleClickCancelButton = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        goToSettings();
        setDropdownField({
          fields: {},
          order: [],
        });
      },
      [goToSettings],
    );

    const debouncedValidation = debounce((value) => checkFieldKeyValidation({ key: value }), 150);

    const handleKeyFieldChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        keyField.onChange(e);
        if (isFirstKeyValidateRun.current) {
          isFirstKeyValidateRun.current = false;
        }
        const value = e.target.value.trim();
        const hasClientError = keyField.validate && keyField.validate(value) !== '';

        if (!hasClientError) {
          setCheckingStatusFieldKeyValidation(true);
          debouncedValidation(value);
        }
      },
      [debouncedValidation, keyField, setCheckingStatusFieldKeyValidation],
    );

    const handleAddOptionClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const id = `${String(new Date().getTime())}_${dropdownField.order.length}`;
        const copiedDropdownFields = { ...dropdownField.fields };
        copiedDropdownFields[id] = {
          value: '',
          error: {
            hasError: false,
            message: '',
          },
        };

        setDropdownField({
          order: [...dropdownField.order, id],
          fields: copiedDropdownFields,
        });
      },
      [dropdownField.fields, dropdownField.order],
    );

    const handleRemoveOptionClick = useCallback(
      (index: number) => () => {
        const key = dropdownField.order[index];
        const copiedDropdownFields = { ...dropdownField.fields };
        delete copiedDropdownFields[key];
        const values = Object.values(copiedDropdownFields).map((field) => field.value);
        const keys = Object.keys(copiedDropdownFields);
        const valuesCounts = countBy(values);
        delete valuesCounts[''];
        const duplicatedValues = new Set();
        Object.values(valuesCounts).forEach((count, index) => {
          if (count > 1) {
            duplicatedValues.add(Object.keys(valuesCounts)[index]);
          }
        });

        if (duplicatedValues.size > 0) {
          keys.forEach((key) => {
            if (duplicatedValues.has(copiedDropdownFields[key].value)) {
              copiedDropdownFields[key].error = {
                hasError: true,
                message: intl.formatMessage({ id: 'desk.customFields.detail.field.dropdown.error.duplicated' }),
              };
            } else {
              copiedDropdownFields[key].error = {
                ...copiedDropdownFields[key].error,
                hasError: false,
              };
            }
          });
        } else {
          keys.forEach((key) => {
            copiedDropdownFields[key].error = {
              ...copiedDropdownFields[key].error,
              hasError: false,
            };
          });
        }

        setDropdownField({
          order: [...dropdownField.order.slice(0, index), ...dropdownField.order.slice(index + 1)],
          fields: copiedDropdownFields,
        });
      },
      [dropdownField.fields, dropdownField.order, intl],
    );

    const handleOptionFieldChange = useCallback(
      (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (value.length > 100) {
          setDropdownField({
            ...dropdownField,
            fields: {
              ...dropdownField.fields,
              [id]: {
                value,
                error: {
                  hasError: true,
                  message: intl.formatMessage(
                    {
                      id: 'desk.customFields.detail.field.dropdown.error.maximum',
                    },
                    { length: 100 - value.length },
                  ),
                },
              },
            },
          });
        } else {
          const copiedDropdownFields = { ...dropdownField.fields };
          copiedDropdownFields[id].value = value;
          const values = Object.values(copiedDropdownFields).map((field) => field.value);
          const keys = Object.keys(copiedDropdownFields);
          const valuesCounts = countBy(values);
          delete valuesCounts[''];
          const duplicatedValues = new Set();
          Object.values(valuesCounts).forEach((count, index) => {
            if (count > 1) {
              duplicatedValues.add(Object.keys(valuesCounts)[index]);
            }
          });

          if (duplicatedValues.size > 0) {
            keys.forEach((key) => {
              if (duplicatedValues.has(copiedDropdownFields[key].value)) {
                copiedDropdownFields[key].error = {
                  hasError: true,
                  message: intl.formatMessage({ id: 'desk.customFields.detail.field.dropdown.error.duplicated' }),
                };
              } else {
                copiedDropdownFields[key].error = {
                  ...copiedDropdownFields[key].error,
                  hasError: false,
                };
              }
            });
          } else {
            keys.forEach((key) => {
              copiedDropdownFields[key].error = {
                ...copiedDropdownFields[key].error,
                hasError: false,
              };
            });
          }

          setDropdownField({
            ...dropdownField,
            fields: copiedDropdownFields,
          });
        }
      },
      [dropdownField, intl],
    );

    const reorderOptions = useCallback(
      ({ startIndex, endIndex }: { startIndex: number; endIndex: number }) => {
        const copiedOrder = [...dropdownField.order];
        const [removed] = copiedOrder.splice(startIndex, 1);
        copiedOrder.splice(endIndex, 0, removed);

        setDropdownField({
          ...dropdownField,
          order: copiedOrder,
        });
      },
      [dropdownField],
    );

    useEffect(() => {
      if (isEditMode) {
        setDropdownField(customFields.options);
      } else {
        const id = `${String(new Date().getTime())}_${dropdownField.order.length}`;
        const fields = {};
        fields[id] = {
          value: '',
          error: {
            hasError: false,
            message: '',
          },
        };

        setDropdownField({
          order: [id],
          fields,
        });
      }
    }, [customFields.options, isEditMode]);

    useEffect(() => {
      if (isEditMode && selectedCustomField) {
        const customFieldType =
          customFieldTypeItems.find((item) => item === selectedCustomField.fieldType) || defaultCustomFieldType;

        labelField.updateValue(selectedCustomField.name);
        keyField.updateValue(selectedCustomField.key);
        descriptionField.updateValue(selectedCustomField.description || '');
        setCustomFieldType(customFieldType);
        setIsReadOnly(selectedCustomField.readOnly);
      }
    }, [selectedCustomField]);

    useEffect(() => {
      const { keyValidation } = customFields;
      if (!isFirstKeyValidateRun.current && !keyValidation.isChecking) {
        const clientErrorMessage = (keyField.validate && keyField.validate(keyField.value)) || '';
        const hasClientError = clientErrorMessage !== '';
        let errorMessage = keyField.error.message;
        if (hasClientError) {
          errorMessage = clientErrorMessage;
        } else if (!keyValidation.isValid) {
          errorMessage = intl.formatMessage({ id: 'desk.customFields.detail.field.key.error.unique' });
        }
        const hasError = !keyValidation.isValid || hasClientError;
        keyField.setValidationError({ hasError, message: errorMessage });
      }
    }, [customFields.keyValidation, keyField.value]);

    const moreItemActions = [
      {
        label: intl.formatMessage({ id: 'desk.customFields.dialog.delete.button' }),
        onClick: () => {
          showDialog({
            dialogTypes: DialogType.Delete,
            dialogProps: {
              title: intl.formatMessage(
                { id: 'desk.customFields.dialog.delete.title' },
                { fieldName: selectedCustomField?.name },
              ),
              description: intl.formatMessage({ id: 'desk.customFields.dialog.delete.description' }),
              cancelText: intl.formatMessage({ id: 'desk.dialogs.button.cancel' }),
              confirmText: intl.formatMessage({ id: 'desk.dialogs.button.delete' }),
              onDelete: () => {
                if (selectedCustomField) {
                  deleteField(selectedCustomField);
                  goToSettings();
                }
              },
            },
          });
        },
      },
    ];

    const handleFieldTypeChange = useCallback((item: CustomFieldTypeItemKey) => {
      setCustomFieldType(item);
    }, []);

    const renderLabelField = useMemo(() => {
      return (
        <SettingsSection
          title={
            <label htmlFor="custom-field-label-field">
              {intl.formatMessage({ id: 'desk.customFields.detail.field.label.title' })}
            </label>
          }
        >
          <FormInput
            id="custom-field-label-field"
            type="text"
            innerRef={labelField.ref}
            name={labelField.name}
            value={labelField.value}
            placeholder={labelField.placeholder}
            disabled={false}
            error={labelField.error}
            onChange={labelField.onChange}
            data-test-id="LabelInput"
          />
        </SettingsSection>
      );
    }, [
      intl,
      labelField.ref,
      labelField.name,
      labelField.value,
      labelField.placeholder,
      labelField.error,
      labelField.onChange,
    ]);

    const renderKeyField = useMemo(() => {
      return (
        <SettingsSection
          title={
            <label htmlFor="custom-field-key-field">
              {intl.formatMessage({ id: 'desk.customFields.detail.field.key.title' })}
            </label>
          }
        >
          <FormInput
            id="custom-field-key-field"
            type="text"
            innerRef={keyField.ref}
            name={keyField.name}
            value={keyField.value}
            placeholder={keyField.placeholder}
            disabled={isEditMode}
            error={keyField.error}
            onChange={handleKeyFieldChange}
            assistiveText={intl.formatMessage({ id: 'desk.customFields.detail.field.key.assistive' })}
            data-test-id="KeyInput"
          />
        </SettingsSection>
      );
    }, [
      isEditMode,
      intl,
      keyField.ref,
      keyField.name,
      keyField.value,
      keyField.placeholder,
      keyField.error,
      handleKeyFieldChange,
    ]);

    const renderDescriptionField = useMemo(() => {
      return (
        <SettingsSection
          title={
            <label htmlFor="custom-field-description-field">
              {intl.formatMessage({ id: 'desk.customFields.detail.field.description.title' })}
            </label>
          }
        >
          <FormInput
            id="custom-field-description-field"
            type="text"
            innerRef={descriptionField.ref}
            name={descriptionField.name}
            value={descriptionField.value}
            placeholder={descriptionField.placeholder}
            disabled={false}
            error={descriptionField.error}
            onChange={descriptionField.onChange}
            data-test-id="DescriptionInput"
          />
        </SettingsSection>
      );
    }, [
      intl,
      descriptionField.ref,
      descriptionField.name,
      descriptionField.value,
      descriptionField.placeholder,
      descriptionField.error,
      descriptionField.onChange,
    ]);

    const getLabelOfCustomField = useCallback(
      (item: string) => intl.formatMessage({ id: dataTypeDropdownLabels[item] }),
      [intl],
    );

    const renderFieldTypeField = useMemo(
      () => (
        <DropdownSection title={intl.formatMessage({ id: 'desk.customFields.detail.field.fieldType.title' })}>
          <Dropdown
            width="100%"
            items={customFieldTypeItems}
            itemToString={getLabelOfCustomField}
            selectedItem={customFieldType}
            onChange={handleFieldTypeChange}
            useSearch={false}
            disabled={isEditMode}
          />
          {customFieldType === 'DROPDOWN' && (
            <DropDownContainer>
              <DragContainer
                options={dropdownField}
                addOption={handleAddOptionClick}
                changeOptionField={handleOptionFieldChange}
                removeOption={handleRemoveOptionClick}
                reorderOptions={reorderOptions}
              />
            </DropDownContainer>
          )}
        </DropdownSection>
      ),
      [
        intl,
        getLabelOfCustomField,
        customFieldType,
        handleFieldTypeChange,
        isEditMode,
        dropdownField,
        handleAddOptionClick,
        handleOptionFieldChange,
        handleRemoveOptionClick,
        reorderOptions,
      ],
    );

    const renderFieldPermission = useMemo(
      () => (
        <SettingsSection
          data-test-id="editPermissionTitleTest"
          title={intl.formatMessage({ id: 'desk.customFields.detail.field.editPermission.title' })}
        >
          <div>
            <InputRadio
              name="types"
              checked={!isReadOnly}
              required={true}
              onChange={handlePermissionFieldChange(false)}
              label={intl.formatMessage({ id: 'desk.customFields.detail.field.editPermission.item.editable' })}
            />
          </div>
          <div>
            <InputRadio
              name="types"
              checked={isReadOnly}
              required={true}
              onChange={handlePermissionFieldChange(true)}
              label={intl.formatMessage({ id: 'desk.customFields.detail.field.editPermission.item.readonly' })}
            />
          </div>
        </SettingsSection>
      ),
      [handlePermissionFieldChange, intl, isReadOnly],
    );

    return (
      <AppSettingsContainer>
        <AppSettingPageHeader>
          <AppSettingPageHeader.BackButton href={backUrl} data-test-id="BackButton" />
          <AppSettingPageHeader.Title>
            {isEditMode
              ? (selectedCustomField && selectedCustomField.name) || ''
              : intl.formatMessage({ id: fieldNameTitle[name] })}
          </AppSettingPageHeader.Title>
          <AppSettingPageHeader.Actions>
            {isEditMode && (
              <>
                <LastUpdateBar>
                  {selectedCustomField &&
                    intl.formatMessage(
                      { id: 'desk.customFields.detail.field.lastUpdated' },
                      { time: moment(selectedCustomField.updatedAt).format('lll') },
                    )}
                </LastUpdateBar>
                <TitleOverflowMenu items={moreItemActions} iconButtonProps={{ buttonType: 'tertiary' }} />
              </>
            )}
          </AppSettingPageHeader.Actions>
        </AppSettingPageHeader>
        <Container>
          <form onSubmit={onFormInputTriggerSubmit}>
            {renderLabelField}
            {renderKeyField}
            {renderDescriptionField}
            {renderFieldTypeField}
            {renderFieldPermission}
            <SettingsCardFooter>
              <Button
                key="cancel"
                buttonType="tertiary"
                size="small"
                onClick={handleClickCancelButton}
                data-test-id="CancelButton"
              >
                {intl.formatMessage({ id: 'desk.customFields.detail.field.cancel.button' })}
              </Button>
              {/* FIXME: add submission test */}
              <Button type="submit" key="save" buttonType="primary" size="small" data-test-id="SaveButton">
                {intl.formatMessage({ id: 'desk.customFields.detail.field.save.button' })}
              </Button>
            </SettingsCardFooter>
          </form>
        </Container>
      </AppSettingsContainer>
    );
  },
);
