import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import { OverflowMenu } from 'feather';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';

import { DeleteDialogBody } from './components';

const StyledOverflowMenu = styled(OverflowMenu)`
  > ul {
    width: 174px;
  }
`;

const SamlSsoConfigButtons: FC<{
  uid: string;
  currentConfiguration: SSOConfigurationFormValues;
}> = ({ uid, currentConfiguration }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const showDialog = useShowDialog();

  const onChangeConfigureButtonClick = useCallback(() => {
    showDialog({
      dialogTypes: DialogType.SSOConfig,
      dialogProps: {
        currentConfiguration,
        isEditMode: true,
        uid,
      },
    });
  }, [currentConfiguration, showDialog, uid]);

  const onDeleteConfigurationButtonClick = useCallback(() => {
    showDialog({
      dialogTypes: DialogType.Delete,
      dialogProps: {
        title: intl.formatMessage({ id: 'common.settings.security.samlsso.deletePopover.title' }),
        description: (
          <DeleteDialogBody>
            {intl.formatMessage({ id: 'common.settings.security.samlsso.deletePopover.description' })}
          </DeleteDialogBody>
        ),
        cancelText: intl.formatMessage({ id: 'common.settings.security.samlsso.deletePopover.cancel' }),
        onDelete: () => {
          dispatch(commonActions.deleteSamlConfigurationRequest());
        },
      },
    });
  }, [dispatch, intl, showDialog]);

  return (
    <div>
      <StyledOverflowMenu
        items={[
          {
            label: intl.formatMessage({ id: 'common.settings.security.samlsso.buttons.edit' }),
            onClick: onChangeConfigureButtonClick,
          },
          {
            label: intl.formatMessage({ id: 'common.settings.security.samlsso.buttons.delete' }),
            onClick: onDeleteConfigurationButtonClick,
          },
        ]}
        stopClickEventPropagation={true}
      />
    </div>
  );
};

export default SamlSsoConfigButtons;
