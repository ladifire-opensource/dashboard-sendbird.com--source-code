import React from 'react';

import { Toggle, ToggleProps } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';

import { SettingsGridCard, SettingsGridCardProps } from './index';

export interface SettingsToggleProps {
  confirmDialogProps: DefaultDialogProps<ConfirmDialogProps>['dialogProps'];
}

interface SettingsCommonGridProps extends SettingsGridCardProps {
  name?: ToggleProps['name'];
  checked?: ToggleProps['checked'];
  autoFocus?: ToggleProps['autoFocus'];
  isToggleDisabled?: ToggleProps['disabled'];
  isFetching?: boolean;
}

type Props = SettingsCommonGridProps & SettingsToggleProps;

export const SettingsToggleGrid: React.FC<Props> = ({
  name,
  checked,
  autoFocus,
  isFetching,
  isToggleDisabled,
  confirmDialogProps,
  isDisabled: isGridCardDisabled,
  ...settingsGridProps
}) => {
  const showDialog = useShowDialog();

  const onToggleClick: ToggleProps['onClick'] = () => {
    showDialog({
      dialogTypes: DialogType.Confirm,
      dialogProps: confirmDialogProps,
    });
  };

  return (
    <SettingsGridCard isDisabled={isGridCardDisabled} {...settingsGridProps}>
      <Toggle
        name={name}
        checked={checked}
        disabled={isFetching || isToggleDisabled || isGridCardDisabled}
        onClick={onToggleClick}
      />
    </SettingsGridCard>
  );
};
