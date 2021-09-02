import { memo, useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import styled from 'styled-components';

import { useForm, useField, cssVariables, Toggle, InputTextarea, HTMLToggleElement } from 'feather';

import { deskActions } from '@actions';
import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { TicketStatus } from '@constants';
import { Unsaved } from '@hooks';
import { TicketStatusLozenge } from '@ui/components';

import { HourMinuteInput } from './HourMinuteInput';

type Props = {
  isAutomaticCloseIdleEnabled: Project['isAutomaticCloseIdleEnabled'];
  idleToCloseDuration: Project['idleToCloseDuration'];
  idleTicketAutomaticCloseMessage: Project['idleTicketAutomaticCloseMessage'];
  isUpdating: DeskStoreState['isUpdating'];
  setUnsaved: Unsaved['setUnsaved'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

const StyledLozenge = styled(TicketStatusLozenge)`
  display: inline-block;
  margin: 0 6px;
`;

const ToggleContainer = styled.div`
  display: flex;

  > button {
    min-width: 40px;
    margin-top: 10px;
    margin-right: 24px;
  }
`;

const ToggleFooter = styled.div`
  margin-top: 16px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  padding-top: 16px;
`;

export const IdleToClosed = memo<Props>(
  ({
    isAutomaticCloseIdleEnabled,
    idleToCloseDuration,
    idleTicketAutomaticCloseMessage,
    isUpdating,
    setUnsaved,
    updateProjectRequest,
  }) => {
    const intl = useIntl();
    const [duration, setDuration] = useState(idleToCloseDuration);
    const [hasError, setHasError] = useState(false);
    const form = useForm({
      onSubmit: (item) => {
        updateProjectRequest({
          ...item,
          onSuccess: form.onSuccess,
          idleToCloseDuration: duration,
        });
      },
    });

    const isEnabledField = useField<boolean, HTMLToggleElement>('isAutomaticCloseIdleEnabled', form, {
      defaultValue: isAutomaticCloseIdleEnabled || false,
      isControlled: true,
    });

    const messageField = useField<string, HTMLTextAreaElement>('idleTicketAutomaticCloseMessage', form, {
      defaultValue: idleTicketAutomaticCloseMessage || '',
      validate: (value) => {
        if (!value.trim()) {
          return intl.formatMessage({ id: 'desk.settings.automation.idleToClosed.error.required' });
        }
        return '';
      },
    });

    const handleToggleClick = (checked) => {
      isEnabledField.updateValue(checked);
    };
    const handleSaveClick = useCallback(
      (e) => {
        form.onSubmit(e);
      },
      [form],
    );

    const handleDurationChange = (hour, minute, error) => {
      setDuration(hour * 60 + minute || 1);
      setHasError(error);
    };

    const isUnsaved = [isEnabledField.updatable, duration !== idleToCloseDuration, messageField.updatable].includes(
      true,
    );
    useEffect(() => {
      setUnsaved(isUnsaved);
    }, [isUnsaved, setUnsaved]);

    const handleCancel = () => {
      form.reset();
      setDuration(idleToCloseDuration);
      setHasError(false);
    };

    return (
      <SettingsGridCard
        title={
          <div style={{ marginTop: '8px' }}>
            <FormattedMessage
              id="desk.settings.automation.changeTicketStatusDuration.title"
              values={{
                from: <StyledLozenge ticketStatus={TicketStatus.IDLE} />,
                to: <StyledLozenge ticketStatus={TicketStatus.CLOSED} />,
              }}
            />
          </div>
        }
        gridItemConfig={{
          subject: {
            alignSelf: 'start',
          },
        }}
        showActions={isUnsaved}
        actions={[
          {
            key: 'idleToClosed-cancel',
            label: intl.formatMessage({ id: 'label.cancel' }),
            buttonType: 'tertiary',
            onClick: handleCancel,
          },
          {
            key: 'idleToClosed-save',
            label: intl.formatMessage({ id: 'label.save' }),
            buttonType: 'primary',
            onClick: handleSaveClick,
            isLoading: isUpdating,
            disabled: hasError || isUpdating,
          },
        ]}
      >
        <ToggleContainer>
          <Toggle checked={isEnabledField.value} onChange={handleToggleClick} />
          <HourMinuteInput
            minutes={duration}
            disabled={!isEnabledField.value}
            onChange={handleDurationChange}
            error={hasError}
          />
        </ToggleContainer>
        <ToggleFooter>
          <InputTextarea
            ref={messageField.ref}
            name={messageField.name}
            defaultValue={messageField.value}
            error={messageField.error}
            disabled={!isEnabledField.value}
            onChange={messageField.onChange}
          />
        </ToggleFooter>
      </SettingsGridCard>
    );
  },
);
