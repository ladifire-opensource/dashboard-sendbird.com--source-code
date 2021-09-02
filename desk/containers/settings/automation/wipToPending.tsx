import { memo, useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import styled from 'styled-components';

import { useForm, useField, Toggle, HTMLToggleElement } from 'feather';

import { deskActions } from '@actions';
import { SettingsGridCard } from '@common/containers/layout';
import { TicketStatus } from '@constants';
import { Unsaved } from '@hooks';
import { TicketStatusLozenge } from '@ui/components';

import { HourMinuteInput } from './HourMinuteInput';

type Props = {
  automaticWipToPendingEnabled: Project['automaticWipToPendingEnabled'];
  wipToPendingDuration: Project['wipToPendingDuration'];
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

export const WipToPending = memo<Props>(
  ({ automaticWipToPendingEnabled, wipToPendingDuration, isUpdating, setUnsaved, updateProjectRequest }) => {
    const intl = useIntl();
    const [duration, setDuration] = useState(wipToPendingDuration);
    const [hasError, setHasError] = useState(false);
    const form = useForm({
      onSubmit: (item) => {
        updateProjectRequest({
          ...item,
          onSuccess: form.onSuccess,
          wipToPendingDuration: duration,
        });
      },
    });

    const isEnabledField = useField<boolean, HTMLToggleElement>('automaticWipToPendingEnabled', form, {
      defaultValue: automaticWipToPendingEnabled,
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

    const handleCancel = () => {
      form.reset();
      setDuration(wipToPendingDuration);
      setHasError(false);
    };

    const isUnsaved = [isEnabledField.updatable, duration !== wipToPendingDuration].includes(true);
    useEffect(() => {
      setUnsaved(isUnsaved);
    }, [isUnsaved, setUnsaved]);

    return (
      <SettingsGridCard
        title={
          <div style={{ marginTop: '8px' }}>
            <FormattedMessage
              id="desk.settings.automation.changeTicketStatusDuration.title"
              values={{
                from: <StyledLozenge ticketStatus={TicketStatus.WIP} />,
                to: <StyledLozenge ticketStatus={TicketStatus.PENDING} />,
              }}
            />
          </div>
        }
        showActions={isUnsaved}
        actions={[
          {
            key: 'wipToPending-cancel',
            label: intl.formatMessage({ id: 'label.cancel' }),
            buttonType: 'tertiary',
            onClick: handleCancel,
          },
          {
            key: 'wipToPending-save',
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
      </SettingsGridCard>
    );
  },
);
