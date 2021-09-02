import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';

export const usePreviousChatDialog = () => {
  const showDialog = useShowDialog();

  return (dialogProps: PreviousChatDialogProps) => {
    showDialog({ dialogTypes: DialogType.PreviousChat, dialogProps });
  };
};
