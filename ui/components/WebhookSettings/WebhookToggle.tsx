import { FC } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import { Toggle } from 'feather';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';

const TitleAttachmentContainer = styled.div`
  margin-left: 16px;
  font-size: 0; // clear vertical margins around inline Switch element
`;

const useWebhookEnableConfirm = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  return ({ enabled, onConfirm }: { enabled: boolean; onConfirm: () => void }) =>
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          title: intl.formatMessage(
            { id: 'core.settings.application.webhooks.toggle_title' },
            { enable: enabled ? 'Enable' : 'Disable' },
          ),
          description: intl.formatMessage(
            { id: 'core.settings.application.webhooks.toggle_desc' },
            { enable: enabled ? 'enable' : 'disable' },
          ),
          onConfirm,
        },
      }),
    );
};

export const WebhookToggle: FC<{ checked?: boolean; onConfirm: (enabled: boolean) => void }> = ({
  checked,
  onConfirm,
}) => {
  const confirm = useWebhookEnableConfirm();
  const handleToggle = (enabled: boolean) => confirm({ enabled, onConfirm: () => onConfirm(enabled) });

  return (
    <TitleAttachmentContainer>
      <Toggle checked={checked} onChange={handleToggle} />
    </TitleAttachmentContainer>
  );
};
