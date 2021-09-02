import { useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { useTechnicalIssueSubmissionAvailability } from '@common/containers/support/useTechnicalIssueSubmissionAvailability';
import { useShowDialog } from '@hooks';
import { CONTACT_US_ALLOWED_PERMISSIONS } from '@hooks/useOrganizationMenu';
import { LinkWithPermissionCheck } from '@ui/components';

export const useFailureDialog = () => {
  const intl = useIntl();
  const { isAvailable: canSubmitTechnicalIssue } = useTechnicalIssueSubmissionAvailability();
  const dispatch = useDispatch();
  const onRetryRef = useRef(() => {});

  const showDialog = useShowDialog({
    dialogTypes: DialogType.Custom,
    dialogProps: {
      title: intl.formatMessage({
        id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.failure.title',
      }),
      description: (
        <div css="white-space: pre-line;">
          {intl.formatMessage(
            { id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.failure.description' },
            {
              a: (text) => (
                <LinkWithPermissionCheck
                  useReactRouter={true}
                  href={`/settings/contact_us${canSubmitTechnicalIssue ? '?category=technical_issue' : ''}`}
                  permissions={CONTACT_US_ALLOWED_PERMISSIONS}
                  onClick={() => {
                    dispatch(commonActions.hideDialogsRequest());
                  }}
                >
                  {text}
                </LinkWithPermissionCheck>
              ),
            },
          )}
        </div>
      ),
      positiveButtonProps: {
        text: intl.formatMessage({
          id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.failure.btn.retry',
        }),
        onClick: () => {
          onRetryRef.current();
        },
      },
      negativeButtonProps: {
        text: intl.formatMessage({
          id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.failure.btn.close',
        }),
      },
    },
  });

  return useCallback(
    (onRetry: () => void) => {
      onRetryRef.current = onRetry;
      showDialog();
    },
    [showDialog],
  );
};
