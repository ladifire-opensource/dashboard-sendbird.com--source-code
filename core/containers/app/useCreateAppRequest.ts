import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, batch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { toast } from 'feather';

import { coreActions, commonActions } from '@actions';
import { requestFreeVoucher } from '@calls/services';
import { DialogType } from '@common/containers/dialogs/DialogType';
import * as coreApi from '@core/api';
import { useAsync, useErrorToast, useOrganization } from '@hooks';

type CreateAppParams = { name: string; region: string; enableCalls: boolean };

/* service */
const createApplicationRequest = async (uid: string, { name, region, enableCalls }: CreateAppParams) => {
  const { data } = await coreApi.createApplication({
    app_name: name,
    organization_uid: uid,
    region,
    is_calls_enabled: enableCalls,
  });
  const { application } = data;

  if (application.attrs.sendbird_calls.enabled) {
    const { isFreeVoucherIssued } = await requestFreeVoucher(application.app_id);
    return { application, isFreeVoucherIssued };
  }

  return { application, isFreeVoucherIssued: false };
};

export const useCreateAppRequest = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory();
  const { uid } = useOrganization();

  const createRequest: (
    params: CreateAppParams,
  ) => Promise<{ application: Application; isFreeVoucherIssued: boolean }> = useCallback(
    (params) => createApplicationRequest(uid, params),
    [uid],
  );

  const [{ data, status, error }, createApplication] = useAsync(createRequest, [createRequest]);

  useEffect(() => {
    if (!data?.application) return;
    const { application, isFreeVoucherIssued } = data;

    toast.success({ message: intl.formatMessage({ id: 'common.createApplication.success' }) });

    batch(() => {
      dispatch(coreActions.setApplicationRequest(application));
      dispatch(coreActions.createAppSuccess(application));

      /* Re-authenticate to sync organization attributes after creating new Calls application */
      if (application.attrs.sendbird_calls.enabled) {
        dispatch(commonActions.verifyAuthenticationRequest());
      }

      /* if Calls free voucher is issued, open free voucher dialog */
      dispatch(
        isFreeVoucherIssued
          ? commonActions.showDialogsRequest({ dialogTypes: DialogType.CallsFreeVoucher })
          : commonActions.hideDialogsRequest(),
      );
    });

    history.push(`/${application.app_id}`);
  }, [data, dispatch, intl, history]);

  useErrorToast(error);

  return {
    isLoading: status === 'loading',
    createApplication,
    error: error?.data?.message ?? null,
  };
};
