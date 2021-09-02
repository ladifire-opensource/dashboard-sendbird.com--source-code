import React, { useEffect, useCallback, useState, FormEvent, FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Button, InputText, Dropdown, TooltipWrapper, TooltipContent, Subtitles, cssVariables } from 'feather';

import { EMPTY_TEXT, URL_REGEX } from '@constants';

import { EllipsisText } from '../ellipsisText';
import { Portal } from '../portal';

export const MAX_STRING_VALUE_LENGTH = 190;
export const MAX_INTEGER_VALUE_LENGTH = 15;
export const MAX_LINK_VALUE_LENGTH = 2083;

const CustomFieldBottom = styled.div`
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
`;

const CustomFieldButton = styled(Button)`
  width: calc(50% - 2px);
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const Form = styled.form`
  & > div + div {
    margin-top: 4px !important;
  }
`;

const DropdownFieldItemTooltipContent = styled.div`
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledTooltipWrapper = styled(TooltipWrapper)`
  max-width: 100%;
`;

const EmptyViewWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 104px;
  ${Subtitles['subtitle-01']}
  color: ${cssVariables('neutral-5')};
`;

type DropdownFieldItemProps = {
  value: string;
};

const DropdownFieldItem: FC<DropdownFieldItemProps> = ({ value }) => (
  <StyledTooltipWrapper
    content={value}
    placement="left"
    popperProps={{
      modifiers: {
        offset: { offset: '0, 8' },
      },
    }}
    target={<EllipsisText component={DropdownFieldItemTooltipContent} text={value} maxLines={2} />}
  >
    {(popperChildrenProps) => (
      <Portal>
        <TooltipContent {...popperChildrenProps} tooltipContentStyle="" content={value} />
      </Portal>
    )}
  </StyledTooltipWrapper>
);

type AddFieldDataPayload = AddCustomerFieldDataRequestPayload | AddTicketFieldDataRequestPayload;

type UpdateFieldDataPayload = UpdateCustomerFieldDataRequestPayload | UpdateTicketFieldDataRequestPayload;

type CustomFieldFormDatas = {
  custom_value?: string;
  link_url?: string;
  link_text?: string;
  dropdown?: string;
};

interface OwnProps {
  id: number;
  customField: CustomField;
  customFieldData?: CustomFieldData;

  addFieldData: (payload: AddFieldDataPayload) => void;
  updateFieldData: (payload: UpdateFieldDataPayload) => void;
  onCancel: () => void;
}

type Props = OwnProps;

export const CustomFieldInputForm = React.memo<Props>(
  ({ id, customField, customFieldData, addFieldData, updateFieldData, onCancel }) => {
    const intl = useIntl();
    const [dropdownQuery, setDropdownQuery] = useState('');
    const handleDropdownQueryChange = (value: string) => {
      setDropdownQuery(value);
    };

    const getDefaultValues = () => {
      if (customFieldData) {
        switch (customField.fieldType) {
          case 'LINK': {
            if (customFieldData.value) {
              const { text, url } = JSON.parse(customFieldData.value);
              return { link_url: url, link_text: text };
            }
            return { link_url: '', link_text: '' };
          }

          case 'DROPDOWN':
            return { dropdown: customFieldData.value };

          default:
            return { custom_value: customFieldData.value };
        }
      }

      return { custom_value: '' };
    };

    const { control, errors, handleSubmit, register, setValue, getValues, trigger } = useForm<CustomFieldFormDatas>({
      mode: 'onChange',
      defaultValues: getDefaultValues(),
    });

    const getSubmitValue = useCallback(
      (data) => {
        switch (customField.fieldType) {
          case 'LINK': {
            const text = data['link_text'].trim();
            const url = data['link_url'].trim();
            if (!text && !url) {
              return '';
            }
            return JSON.stringify({ text, url });
          }

          case 'DROPDOWN':
            return data['dropdown'] === EMPTY_TEXT ? '' : data['dropdown'].trim();

          default:
            return data['custom_value'].trim();
        }
      },
      [customField.fieldType],
    );

    const onSubmit = useCallback(
      (data: CustomFieldFormDatas, e?: FormEvent) => {
        e?.preventDefault();
        if (customFieldData) {
          updateFieldData({
            id: customFieldData.id,
            value: getSubmitValue(data),
          });
        } else {
          addFieldData({
            id,
            fieldId: customField.id,
            value: getSubmitValue(data),
          });
        }
        onCancel();
      },
      [addFieldData, customField.id, customFieldData, getSubmitValue, id, onCancel, updateFieldData],
    );

    const handleDropdownItemClick = (item) => {
      onSubmit({ dropdown: item });
    };

    useEffect(() => {
      if (customFieldData) {
        switch (customField.fieldType) {
          case 'DROPDOWN': {
            if (customFieldData !== undefined) {
              setValue('dropdown', customFieldData.value);
            }
            break;
          }

          case 'LINK': {
            if (customFieldData.value) {
              const { text, url } = JSON.parse(customFieldData.value);
              setValue('link_url', url);
              setValue('link_text', text);
            } else {
              setValue('link_url', '');
              setValue('link_text', '');
            }
            break;
          }

          default: {
            if (customFieldData !== undefined) {
              setValue('custom_value', customFieldData.value);
            }
            break;
          }
        }
      }
    }, [customField.fieldType, customFieldData, setValue]);

    const handleClickCancelButton = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onCancel();
      },
      [onCancel],
    );

    const handleLinkTextChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      if (!e.target.value && !getValues().link_url) {
        trigger('link_url');
      }
    };

    const handleKeyDownField = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        const ENTER_KEY_CODE = 13;
        const ESC_KEY_CODE = 27;

        switch (e.keyCode) {
          case ENTER_KEY_CODE: {
            e.preventDefault();
            if (customField.fieldType === 'LINK') {
              onSubmit(getValues());
            } else {
              handleSubmit(onSubmit);
            }
            break;
          }
          case ESC_KEY_CODE: {
            onCancel();
            break;
          }
          default:
            return;
        }
      },
      [customField.fieldType, getValues, handleSubmit, onCancel, onSubmit],
    );

    const errorProcessor = useCallback(
      (key) => {
        return errors[key]
          ? {
              hasError: true,
              message: errors[key].message || '',
            }
          : undefined;
      },
      [errors],
    );

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        {customField.fieldType === 'DROPDOWN' && customField.options && (
          <Controller
            name="dropdown"
            control={control}
            rules={{ required: true }}
            render={() => {
              return (
                <Dropdown<string>
                  items={[EMPTY_TEXT, ...(customField.options || [])].filter(
                    (option) => !dropdownQuery || option.match(new RegExp(dropdownQuery, 'ig')),
                  )}
                  itemToElement={(item) => <DropdownFieldItem value={item} />}
                  selectedItem={customFieldData?.value || EMPTY_TEXT}
                  placement="bottom-end"
                  placeholder="Select"
                  width="100%"
                  size="small"
                  useSearch={true}
                  searchPlaceholder={intl.formatMessage({
                    id: 'desk.customFields.ticketPanel.field.input.dropdown.searchPlaceholder',
                  })}
                  onItemSelected={handleDropdownItemClick}
                  onSearchChange={handleDropdownQueryChange}
                  hasError={errorProcessor('dropdown')?.hasError}
                  emptyView={
                    <EmptyViewWrapper>
                      {intl.formatMessage({ id: 'desk.customFields.ticketPanel.field.input.dropdown.noResult' })}
                    </EmptyViewWrapper>
                  }
                />
              );
            }}
          />
        )}
        {customField.fieldType === 'LINK' && (
          <>
            <InputText
              ref={register({
                pattern: {
                  value: URL_REGEX,
                  message: intl.formatMessage({ id: 'desk.customFields.ticketPanel.field.error.link.url.invalid' }),
                },
                validate: {
                  maximum: (value) => {
                    if (value.trim().length > MAX_LINK_VALUE_LENGTH) {
                      return intl.formatMessage(
                        { id: 'desk.customFields.ticketPanel.field.error.link.url.maximum' },
                        {
                          limit: MAX_LINK_VALUE_LENGTH,
                        },
                      );
                    }
                  },
                  required: (value) => {
                    if (!value.trim() && getValues().link_text?.trim()) {
                      return intl.formatMessage({ id: 'desk.customFields.ticketPanel.field.error.link.url.required' });
                    }
                  },
                },
              })}
              name="link_url"
              size="small"
              placeholder="URL"
              error={errorProcessor('link_url')}
              onKeyDown={handleKeyDownField}
            />
            <InputText
              ref={register({
                validate: {
                  maximum: (value) => {
                    if (value.trim().length > MAX_STRING_VALUE_LENGTH) {
                      return intl.formatMessage(
                        { id: 'desk.customFields.ticketPanel.field.error.link.text.maximum' },
                        { limit: MAX_STRING_VALUE_LENGTH },
                      );
                    }
                  },
                },
              })}
              name="link_text"
              size="small"
              placeholder={intl.formatMessage({ id: 'desk.customFields.ticketPanel.field.input.link.placeholder' })}
              error={errorProcessor('link_text')}
              onKeyDown={handleKeyDownField}
              onChange={handleLinkTextChange}
            />
          </>
        )}
        {['STRING', 'INTEGER'].includes(customField.fieldType) && (
          <InputText
            ref={register({
              required: false,
              validate: {
                validateStringOrInteger: (value) => {
                  if (customField.fieldType === 'INTEGER') {
                    const regex = /^[-]?[0-9]+$/;
                    if (!regex.test(value.trim())) {
                      return intl.formatMessage({ id: 'desk.customFields.ticketPanel.field.error.numeric.invalid' });
                    }
                    if (value.trim().length > MAX_INTEGER_VALUE_LENGTH) {
                      return intl.formatMessage(
                        { id: 'desk.customFields.ticketPanel.field.error.numeric.maximum' },
                        { limit: MAX_INTEGER_VALUE_LENGTH },
                      );
                    }
                  } else if (customField.fieldType === 'STRING') {
                    if (value.trim().length > MAX_STRING_VALUE_LENGTH) {
                      return intl.formatMessage(
                        { id: 'desk.customFields.ticketPanel.field.error.string.maximum' },
                        { limit: MAX_STRING_VALUE_LENGTH },
                      );
                    }
                  }
                },
              },
            })}
            name="custom_value"
            size="small"
            placeholder={intl.formatMessage(
              { id: 'desk.customFields.ticketPanel.field.input.normal.placeholder' },
              { fieldName: customField.name },
            )}
            error={errorProcessor('custom_value')}
            onKeyDown={handleKeyDownField}
          />
        )}
        {['STRING', 'INTEGER', 'LINK'].includes(customField.fieldType) && (
          <CustomFieldBottom data-test-id="CustomFieldButtonGroup">
            <CustomFieldButton key="cancel" buttonType="tertiary" onClick={handleClickCancelButton}>
              {intl.formatMessage({ id: 'desk.customFields.ticketPanel.field.input.actions.cancel' })}
            </CustomFieldButton>
            <CustomFieldButton key="save" buttonType="primary" type="submit">
              {intl.formatMessage({ id: 'desk.customFields.ticketPanel.field.input.actions.save' })}
            </CustomFieldButton>
          </CustomFieldBottom>
        )}
      </Form>
    );
  },
);
