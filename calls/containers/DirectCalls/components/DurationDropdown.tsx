import { ChangeEvent, FC, FormEvent, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Checkbox, Dropdown, DropdownProps, IconButton, InputText, Subtitles } from 'feather';
import isEqual from 'lodash/isEqual';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog, useTypedSelector } from '@hooks';
import { CancelButton, ConfirmButton, Dialog, DialogFormAction, DialogFormBody } from '@ui/components';

export type Duration = { min?: number; max?: number };

enum DurationDropdownItem {
  All = 'All',
  Under10Minutes = 'Under10Minutes',
  Over10Minutes = 'Over10Minutes',
  Over30Minutes = 'Over30Minutes',
  Over60Minutes = 'Over60Minutes',
}

type Props = Omit<
  DropdownProps<DurationDropdownItem>,
  'items' | 'size' | 'placeholder' | 'onChange' | 'selectedItem'
> & {
  onChange?: (duration: Duration) => void;
  selected?: Duration;
};

const dropdownStyle = css`
  display: flex;
  align-items: center;
  padding-left: 12px;
  padding-right: 8px;

  > label {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;

    > span {
      white-space: nowrap;
      padding-right: 16px;
    }
  }
`;

const DurationToggle = styled.span`
  ${Subtitles['subtitle-01']}
  margin-left: 16px;
  margin-right: 4px;
`;

const millisecondsPerMinute = 60000;
const [tenMinutes, thirtyMinutes, sixtyMinutes] = [10, 30, 60].map((minutes) => minutes * millisecondsPerMinute);

const durations: Record<DurationDropdownItem, Duration> = {
  [DurationDropdownItem.All]: { min: undefined, max: undefined },
  [DurationDropdownItem.Under10Minutes]: { min: undefined, max: tenMinutes },
  [DurationDropdownItem.Over10Minutes]: { min: tenMinutes, max: undefined },
  [DurationDropdownItem.Over30Minutes]: { min: thirtyMinutes, max: undefined },
  [DurationDropdownItem.Over60Minutes]: { min: sixtyMinutes, max: undefined },
};

const labels: Record<DurationDropdownItem, string> = {
  [DurationDropdownItem.All]: 'calls.callLogs.duration_label.all',
  [DurationDropdownItem.Under10Minutes]: 'calls.callLogs.duration_label.under10Minutes',
  [DurationDropdownItem.Over10Minutes]: 'calls.callLogs.duration_label.over10Minutes',
  [DurationDropdownItem.Over30Minutes]: 'calls.callLogs.duration_label.over30Minutes',
  [DurationDropdownItem.Over60Minutes]: 'calls.callLogs.duration_label.over60Minutes',
};

type DialogProps = DefaultDialogProps<DirectCallsDurationLimitDialogProps>;

export const DirectCallsDurationLimitDialog: FC<DialogProps> = ({ onClose, dialogProps }) => {
  const intl = useIntl();
  const [value, setValue] = useState(dialogProps.initialValue);
  const submittable = value > 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dialogProps.onSubmit?.(value);
    onClose();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(e.target.value) * 1000 || 0);
  };

  return (
    <Dialog
      title={intl.formatMessage({ id: 'calls.callLogs.duration.dialog.title' })}
      description={intl.formatMessage({ id: 'calls.callLogs.duration.dialog.description' })}
      onClose={onClose}
      size="small"
      body={
        <form onSubmit={handleSubmit}>
          <DialogFormBody>
            <InputText
              value={value * 0.001 || ''}
              onChange={handleChange}
              css={css`
                display: inline-flex;
                width: 96px;
                margin-right: 8px;
              `}
            />
            {intl.formatMessage({ id: 'calls.callLogs.duration.dialog.unit' })}
          </DialogFormBody>
          <DialogFormAction>
            <CancelButton type="button" onClick={onClose}>
              {intl.formatMessage({ id: 'calls.callLogs.duration.dialog.buttons.cancel' })}
            </CancelButton>
            <ConfirmButton type="submit" disabled={!submittable}>
              {intl.formatMessage({ id: 'calls.callLogs.duration.dialog.buttons.save' })}
            </ConfirmButton>
          </DialogFormAction>
        </form>
      }
    />
  );
};

const useDurationLimitDialog = () => {
  const showDialog = useShowDialog();

  return (dialogProps: DirectCallsDurationLimitDialogProps) =>
    showDialog({ dialogTypes: DialogType.DirectCallsDurationLimit, dialogProps });
};

const SettingButton: FC<{ onClick?: () => void }> = (props) => {
  const intl = useIntl();
  return (
    <IconButton
      buttonType="secondary"
      size="xsmall"
      icon="settings"
      title={intl.formatMessage({ id: 'calls.callLogs.duration_label.limit.tooltip' })}
      {...props}
    />
  );
};

export const DurationDropdown: FC<Props> = ({ onChange, selected, ...props }) => {
  const intl = useIntl();
  const onChangeRef = useRef<typeof onChange | null>(null);

  const [selectedItem, setSelectedItem] = useState(() => {
    if (!selected) return DurationDropdownItem.All;
    return (Object.keys(durations).find((id: DurationDropdownItem) => {
      const { min, max } = durations[id];
      if (min) return min === selected.min;
      if (max) return max === selected.max;
      return min === selected.min && max === selected.max;
    }) ?? DurationDropdownItem.All) as DurationDropdownItem;
  });
  const [limitEnabled, setLimitEnabled] = useState(!!selected?.min && selected?.min !== durations[selectedItem].min);
  const [minLimitValue, setMinLimitValue] = useState((limitEnabled && selected?.min) || 5000);
  const showDurationLimitDialog = useDurationLimitDialog();
  const isDialogOpened = useTypedSelector((state) => !!state.dialogs.dialogTypes);

  const handleChange = (item: DurationDropdownItem | null) => item && setSelectedItem(item);

  const handleToggle = (e: ChangeEvent<HTMLInputElement>) => setLimitEnabled(e.target.checked);

  useEffect(() => {
    const nextDuration = {
      min: Math.max(limitEnabled ? minLimitValue : 0, durations[selectedItem].min ?? 0) || undefined,
      max: durations[selectedItem].max,
    };

    if (!isEqual(selected, nextDuration)) {
      onChangeRef.current?.(nextDuration);
    }
  }, [onChangeRef, limitEnabled, minLimitValue, selectedItem, selected]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const formattedValue = minLimitValue * 0.001;

  return (
    <Dropdown<DurationDropdownItem>
      toggleRenderer={({ selectedItem }) => {
        return (
          selectedItem && (
            <DurationToggle>
              {intl.formatMessage({ id: labels[selectedItem] })}
              {limitEnabled &&
                ` ${intl.formatMessage(
                  { id: 'calls.callLogs.duration_label.selectedLimit' },
                  { value: formattedValue },
                )}`}
            </DurationToggle>
          )
        );
      }}
      footer={
        <Checkbox
          checked={limitEnabled}
          onChange={handleToggle}
          label={
            <>
              <span>
                {intl.formatMessage({ id: 'calls.callLogs.duration_label.limit' }, { value: formattedValue })}
              </span>
              <SettingButton
                onClick={() => showDurationLimitDialog({ onSubmit: setMinLimitValue, initialValue: minLimitValue })}
              />
            </>
          }
          name="durationLimit"
          css={dropdownStyle}
        />
      }
      items={Object.keys(DurationDropdownItem) as DurationDropdownItem[]}
      itemToString={(item: DurationDropdownItem) => intl.formatMessage({ id: labels[item] })}
      size="small"
      placeholder={intl.formatMessage({ id: 'calls.callLogs.filters.duration.placeholder' })}
      onChange={handleChange}
      selectedItem={selectedItem}
      stateReducer={(_, changes) => (!changes.isOpen && isDialogOpened ? {} : changes)} // Override to keep the menu open when dialog is open
      {...props}
    />
  );
};
