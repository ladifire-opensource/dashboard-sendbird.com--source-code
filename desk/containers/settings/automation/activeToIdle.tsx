import { memo, useEffect, useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import styled from 'styled-components';

import { useForm, useField, HTMLToggleElement, Toggle } from 'feather';

import { deskActions } from '@actions';
import { SettingsGridCard } from '@common/containers/layout';
import { TicketStatus } from '@constants';
import { Unsaved } from '@hooks';
import { TicketStatusLozenge } from '@ui/components';

import { HourMinuteInput } from './HourMinuteInput';

type Props = {
  activeToIdleEnabled: Project['activeToIdleEnabled'];
  activeToIdleDuration: Project['activeToIdleDuration'];
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

export const ActiveToIdle = memo<Props>(
  ({ activeToIdleEnabled, activeToIdleDuration, isUpdating, setUnsaved, updateProjectRequest }) => {
    const intl = useIntl();
    const [duration, setDuration] = useState(activeToIdleDuration);
    const [hasError, setHasError] = useState(false);
    const form = useForm({
      onSubmit: (item) => {
        updateProjectRequest({
          ...item,
          onSuccess: form.onSuccess,
          activeToIdleDuration: duration,
        });
      },
    });

    const isEnabledField = useField<boolean, HTMLToggleElement>('activeToIdleEnabled', form, {
      defaultValue: activeToIdleEnabled || false,
      isControlled: true,
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

    const isUnsaved = [isEnabledField.updatable, duration !== activeToIdleDuration].some((updatable) => updatable);
    useEffect(() => {
      setUnsaved(isUnsaved);
    }, [setUnsaved, isUnsaved]);

    const handleCancel = () => {
      form.reset();
      setDuration(activeToIdleDuration);
      setHasError(false);
    };

    return (
      <SettingsGridCard
        title={
          <div style={{ marginTop: '8px' }}>
            <FormattedMessage
              id="desk.settings.automation.changeTicketStatusDuration.title"
              values={{
                from: <StyledLozenge ticketStatus={TicketStatus.ACTIVE} />,
                to: <StyledLozenge ticketStatus={TicketStatus.IDLE} />,
              }}
            />
          </div>
        }
        showActions={isUnsaved}
        actions={[
          {
            key: 'activeToIdleDuration-cancel',
            label: intl.formatMessage({ id: 'label.cancel' }),
            buttonType: 'tertiary',
            onClick: handleCancel,
          },
          {
            key: 'activeToIdleDuration-save',
            label: intl.formatMessage({ id: 'label.save' }),
            buttonType: 'primary',
            onClick: handleSaveClick,
            isLoading: isUpdating,
            disabled: hasError || isUpdating,
          },
        ]}
        gridItemConfig={{
          subject: {
            alignSelf: 'start',
          },
        }}
      >
        <ToggleContainer>
          <Toggle checked={isEnabledField.value} onChange={handleToggleClick} />
          <HourMinuteInput
            minutes={duration}
            onChange={handleDurationChange}
            error={hasError}
            disabled={!isEnabledField.value}
          />
        </ToggleContainer>
      </SettingsGridCard>
    );
  },
);
