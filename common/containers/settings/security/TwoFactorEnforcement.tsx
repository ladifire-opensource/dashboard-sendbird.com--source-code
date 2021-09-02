import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { commonActions } from '@actions';
import { enforce2FA } from '@common/api';
import { SettingsCardGroup, SettingsToggleGrid } from '@common/containers/layout';
import { useAsync, useTypedSelector } from '@hooks';

const useEnforce2FA = (uid) => {
  const dispatch = useDispatch();

  const [{ status, data }, update] = useAsync((enforce) => enforce2FA({ uid, enforce }), [uid]);

  useEffect(() => {
    if (data) {
      dispatch(commonActions.updateOrganizationSuccess(data.data.organization));
    }
  }, [dispatch, data]);
  return {
    loading: status === 'loading',
    update,
  };
};

export const TwoFactorEnforcement = () => {
  const intl = useIntl();
  const { uid, enforce_two_factor_authentication } = useTypedSelector((state) => state.organizations.current);
  const { loading, update } = useEnforce2FA(uid);

  return (
    <SettingsCardGroup>
      <SettingsToggleGrid
        title={intl.formatMessage({ id: 'common.settings.security.enforce2fa.title' })}
        description={intl.formatMessage({ id: 'common.settings.security.enforce2fa.description' })}
        checked={enforce_two_factor_authentication}
        isFetching={loading}
        confirmDialogProps={{
          title: intl.formatMessage({
            id: enforce_two_factor_authentication
              ? 'common.settings.security.enforce2fa.confirmDialog.off.title'
              : 'common.settings.security.enforce2fa.confirmDialog.on.title',
          }),
          description: intl.formatMessage({
            id: enforce_two_factor_authentication
              ? 'common.settings.security.enforce2fa.confirmDialog.off.description'
              : 'common.settings.security.enforce2fa.confirmDialog.on.description',
          }),
          confirmText: intl.formatMessage({ id: 'common.settings.security.enforce2fa.confirmDialog.button.confirm' }),
          onConfirm: () => update(!enforce_two_factor_authentication),
        }}
        gridItemConfig={{ body: { alignSelf: 'start' } }}
      />
    </SettingsCardGroup>
  );
};
