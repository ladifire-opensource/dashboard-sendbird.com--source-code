import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { Body, cssVariables, InlineNotification, Radio, SpinnerFull, toast, Toggle } from 'feather';
import isEqual from 'lodash/isEqual';

import { ChatIntegrationEvent, ChatIntegrationSetting, fetchChatIntegration, updateChatIntegration } from '@calls/api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsGridCard, SettingsGridGroup } from '@common/containers/layout/settingsGrid';
import { useAppId, useAsync, useErrorToast, useIsCallsEnabled, useShowDialog } from '@hooks';

enum Option {
  END = 'END',
  DIAL_AND_END = 'DIAL_AND_END',
}
const DEFAULT_OPTION = Option.END;
type CallsIntegrationForm = { option?: Option; enabled: boolean };

type UpdatePayload = Parameters<typeof updateChatIntegration>[1];

const Events: Record<Option, ChatIntegrationEvent[]> = {
  [Option.END]: ['direct_call:end'],
  [Option.DIAL_AND_END]: ['direct_call:dial', 'direct_call:end'],
};

const toOption = (targetEvents: ChatIntegrationEvent[]): Option | undefined => {
  const found = Object.entries(Events).find(([, events]) => isEqual(events, targetEvents));
  if (!found) return undefined;

  const [option] = found;
  return option as Option;
};

const OptionList = styled.ul<{ $disabled?: boolean }>`
  list-style: none;

  li {
    > div {
      display: block;
    }

    > span {
      margin-top: 4px;
      padding-left: 28px;
      color: ${cssVariables('neutral-7')};
      ${Body['body-short-01']}
    }

    ${(props) =>
      props.$disabled &&
      css`
        cursor: not-allowed;

        > span {
          color: ${cssVariables('neutral-5')};
        }
      `}
  }

  li + li {
    margin-top: 16px;
  }
`;

const FormContainer = styled.div`
  > hr {
    border: none;
    height: 1px;
    margin: 24px 0;
    background: ${cssVariables('neutral-3')};
  }
`;

const Container = styled(SettingsGridGroup)`
  position: relative;

  > [role='progressbar'] {
    position: absolute;
    top: 0;
  }
`;

const NotActivatedNotification = () => {
  const intl = useIntl();

  return (
    <InlineNotification
      type="info"
      css={css`
        * + & {
          margin-top: 16px;
        }

        a {
          text-decoration: underline;
          color: ${cssVariables('neutral-10')};
        }
      `}
      message={intl.formatMessage(
        { id: 'chat.settings.messages.callsIntegration.form.notActivated' },
        { a: (text: string) => <Link to="../calls">{text}</Link> },
      )}
    />
  );
};

const useCallsIntegration = () => {
  const intl = useIntl();
  const appId = useAppId();

  const [{ status: fetchStatus, error: fetchError, data: fetchResponse }, fetch] = useAsync(
    () => fetchChatIntegration(appId),
    [appId],
  );
  const [{ status: updateStatus, error: updateError, data: updateResponse }, update] = useAsync(
    (payload: UpdatePayload) => updateChatIntegration(appId, payload),
    [appId],
  );

  const [callsIntegration, setCallsIntegration] = useState<ChatIntegrationSetting>();
  const [error, setError] = useState<any>();

  const loading = [fetchStatus, updateStatus].includes('loading');

  /* sync latest Calls integration data when get response of fetch or update */
  useEffect(() => {
    fetchResponse && setCallsIntegration(fetchResponse.data.chat_integration);
  }, [fetchResponse]);

  useEffect(() => {
    updateResponse && setCallsIntegration(updateResponse.data.chat_integration);
  }, [updateResponse]);

  useEffect(() => {
    updateResponse &&
      toast.success({ message: intl.formatMessage({ id: 'chat.settings.messages.callsIntegration.toast.success' }) });
  }, [updateResponse, intl]);

  useEffect(() => {
    fetchError && setError(fetchError);
  }, [fetchError]);

  useEffect(() => {
    updateError && setError(updateError);
  }, [updateError]);

  return { callsIntegration, loading, error, load: fetch, update };
};

const useToggleConfirm = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  return ({ enabled, onConfirm }: { enabled: boolean; onConfirm: () => void }) => {
    showDialog({
      dialogTypes: DialogType.Confirm,
      dialogProps: {
        title: intl.formatMessage({
          id: enabled
            ? 'chat.settings.messages.callsIntegration.form.confirm.title.on'
            : 'chat.settings.messages.callsIntegration.form.confirm.title.off',
        }),
        description: intl.formatMessage({
          id: enabled
            ? 'chat.settings.messages.callsIntegration.form.confirm.description.on'
            : 'chat.settings.messages.callsIntegration.form.confirm.description.off',
        }),
        confirmText: intl.formatMessage({
          id: enabled
            ? 'chat.settings.messages.callsIntegration.form.confirm.submit.on'
            : 'chat.settings.messages.callsIntegration.form.confirm.submit.off',
        }),
        onConfirm,
      },
    });
  };
};

const formOptions = [
  {
    value: Option.END,
    label: 'chat.settings.messages.callsIntegration.form.end.label',
    description: 'chat.settings.messages.callsIntegration.form.end.description',
  },
  {
    value: Option.DIAL_AND_END,
    label: 'chat.settings.messages.callsIntegration.form.dialAndEnd.label',
    description: 'chat.settings.messages.callsIntegration.form.dialAndEnd.description',
  },
];

const CallsIntegrationForm: FC<{
  initialValue: CallsIntegrationForm;
  isLoading?: boolean;
  disabled?: boolean;
  footer?: ReactNode;
  onSubmit?: (form: CallsIntegrationForm) => void;
}> = ({ initialValue, isLoading, disabled, footer, onSubmit }) => {
  const intl = useIntl();
  const initialOption = initialValue.option ?? DEFAULT_OPTION;
  const [selectedOption, setSelectedOption] = useState(initialOption);
  const confirm = useToggleConfirm();

  const handleSubmit = (enabled: boolean) => () => onSubmit?.({ option: selectedOption, enabled });

  const handleReset = () => setSelectedOption(initialOption);

  const handleToggleChange = (enabled: boolean) => confirm({ enabled, onConfirm: handleSubmit(enabled) });

  const handleOptionChange = (option: Option) => () => setSelectedOption(option);

  const isToggleDisabled = isLoading || disabled;
  const isOptionListDisabled = isToggleDisabled || !initialValue.enabled;

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'chat.settings.messages.callsIntegration.title' })}
      description={intl.formatMessage({ id: 'chat.settings.messages.callsIntegration.description' })}
      showActions={initialOption !== selectedOption}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
      actions={[
        {
          key: 'cancel',
          label: intl.formatMessage({ id: 'label.cancel' }),
          buttonType: 'tertiary',
          onClick: handleReset,
          disabled: isLoading,
        },
        {
          key: 'save',
          label: intl.formatMessage({ id: 'label.save' }),
          buttonType: 'primary',
          onClick: handleSubmit(initialValue.enabled),
          isLoading,
          disabled,
        },
      ]}
    >
      <FormContainer>
        <Toggle checked={initialValue.enabled} disabled={isToggleDisabled} onChange={handleToggleChange} />
        <hr />
        <OptionList $disabled={isOptionListDisabled}>
          {formOptions.map(({ value, label, description }) => (
            <li key={label}>
              <Radio
                name="callsIntegration"
                label={intl.formatMessage({ id: label })}
                checked={value === selectedOption}
                value={value}
                disabled={isOptionListDisabled}
                onChange={handleOptionChange(value)}
              />
              <span>{intl.formatMessage({ id: description })}</span>
            </li>
          ))}
        </OptionList>
      </FormContainer>
      {footer}
    </SettingsGridCard>
  );
};

const FormPlaceholder: FC<{ footer: ReactNode }> = ({ footer }) => (
  <CallsIntegrationForm initialValue={{ enabled: false }} disabled={true} footer={footer} />
);

export const CallsIntegration = () => {
  const { callsIntegration, loading, error, load, update } = useCallsIntegration();
  const isCallsEnabled = useIsCallsEnabled();

  useEffect(() => {
    isCallsEnabled && load();
  }, [isCallsEnabled, load]);

  useErrorToast(error);

  const handleSubmit = ({ enabled, option }: CallsIntegrationForm) =>
    update({ enabled, enabled_events: option ? Events[option] : [] });

  const form = useMemo(() => {
    if (!callsIntegration) return undefined;
    const { enabled, enabled_events } = callsIntegration;
    return { enabled, option: toOption(enabled_events) };
  }, [callsIntegration]);

  return (
    <Container>
      {form ? (
        <CallsIntegrationForm initialValue={form} isLoading={loading} onSubmit={handleSubmit} />
      ) : (
        <FormPlaceholder footer={!isCallsEnabled && <NotActivatedNotification />} />
      )}
      {loading && !form && <SpinnerFull />}
    </Container>
  );
};
