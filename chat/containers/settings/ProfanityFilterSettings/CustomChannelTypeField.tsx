import { forwardRef, FocusEventHandler, useState, ChangeEventHandler } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { InputText, Icon, cssVariables, InlineNotification, Typography } from 'feather';

import { fetchGroupChannels } from '@chat/api';
import { fetchSettingsForCustomChannelType } from '@core/api';
import { useAppId } from '@hooks';
import { PropsOf } from '@utils';

type Props = {
  defaultValue?: string;
  setFormError: (errorType: string | null) => void;
} & Omit<PropsOf<typeof InputText>, 'defaultValue'>;

enum CustomChannelTypeFoundStatus {
  Found,
  NotFound,
  Unknown,
}

const NotFoundNotification = styled(InlineNotification)`
  margin-top: 8px;
`;

const HelperText = styled.span`
  display: flex;
  align-items: center;
  margin-top: 4px;
  color: ${cssVariables('purple-7')};
  ${Typography['caption-01']};

  svg {
    margin-right: 4px;
  }
`;

export const CustomChannelTypeField = forwardRef<HTMLInputElement, Props>(({ setFormError, ...inputProps }, ref) => {
  const appId = useAppId();
  const intl = useIntl();
  const [inputValue, setInputValue] = useState(inputProps.defaultValue || '');
  const [customTypeFoundState, setCustomTypeFoundState] = useState<{
    value: string;
    status: CustomChannelTypeFoundStatus;
  }>({ value: (inputProps.defaultValue as string) || '', status: CustomChannelTypeFoundStatus.Unknown });

  const isCustomChannelTypeSettingDuplicated = async (customType: string) => {
    try {
      await fetchSettingsForCustomChannelType({ appId, custom_type: customType });
      return true;
    } catch {
      // failed to find a corresponding channel settings.
      return false;
    }
  };

  const isCustomChannelTypeFound = async (customType: string) => {
    const { data } = await fetchGroupChannels({ appId, limit: 1, showEmpty: true, customType });
    return data.channels.length > 0;
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = async (event) => {
    const { value } = event.target;

    if (!value.trim()) {
      setFormError('required');
      return;
    }

    if (await isCustomChannelTypeSettingDuplicated(value)) {
      // Channel custom type setting already exists.
      setFormError('duplicated');
      setCustomTypeFoundState({ value, status: CustomChannelTypeFoundStatus.Unknown });
      return;
    }

    setFormError(null);
    try {
      if (await isCustomChannelTypeFound(value)) {
        setCustomTypeFoundState({ value, status: CustomChannelTypeFoundStatus.Found });
        return;
      }
      setCustomTypeFoundState({ value, status: CustomChannelTypeFoundStatus.NotFound });
    } catch {
      // when it failed to fetch group channels with the custom type,
      // just ignore it so it can be validated again on submission.
      setCustomTypeFoundState({ value, status: CustomChannelTypeFoundStatus.Unknown });
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    inputProps.onChange?.(event);
    setInputValue(event.target.value);
    if (inputProps.error?.hasError) {
      setFormError(null);
    }
  };

  return (
    <>
      <InputText
        type="text"
        ref={ref}
        {...inputProps}
        onChange={handleChange}
        onBlur={inputProps.readOnly || inputProps.disabled ? undefined : handleBlur}
      />
      {customTypeFoundState.value === inputValue && (
        <>
          {customTypeFoundState.status === CustomChannelTypeFoundStatus.Found && (
            <HelperText role="status">
              <Icon size={16} color={cssVariables('purple-7')} icon="success-filled" />
              {intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.customChannelType.inUse' })}
            </HelperText>
          )}
          {customTypeFoundState.status === CustomChannelTypeFoundStatus.NotFound && (
            <NotFoundNotification
              role="status"
              type="warning"
              message={intl.formatMessage({
                id: 'chat.settings.profanityFilter.form.field.customChannelType.neverUsed',
              })}
            />
          )}
        </>
      )}
    </>
  );
});
