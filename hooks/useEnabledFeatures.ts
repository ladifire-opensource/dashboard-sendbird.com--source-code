import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { toast } from 'feather';

import { coreActions } from '@actions';
import { convertEnabledFeaturesObjectToFeatureKeys } from '@authorization';
import { ChatFeatureName } from '@constants';
import { fetchEnabledFeatures, updateEnabledFeatures } from '@core/api';
import { getErrorMessage } from '@epics';
import { useAuthorization } from '@hooks/useAuthorization';

import { useAsync } from './useAsync';

export const useEnabledFeatures = (appId) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { setEnabledFeatures, isSelfService } = useAuthorization();
  const [{ status, data }, load] = useAsync<{
    data: EnabledFeatures;
  }>(async () => {
    return fetchEnabledFeatures(appId || '');
  }, [appId]);

  const [{ status: updateStatus, data: updateData, error: updateError }, update] = useAsync<{
    data: EnabledFeatures;
  }>(
    async (payload: Record<ChatFeatureName, boolean>) => {
      return updateEnabledFeatures({ app_id: appId || '', payload });
    },
    [appId],
  );

  useEffect(() => {
    if (isSelfService) {
      load();
    }
  }, [isSelfService, load]);

  useEffect(() => {
    if (updateError) {
      const errorMessage = getErrorMessage(updateError);
      if (typeof updateError.data?.detail === 'object') {
        // ignore error if detail is an object because it will be handled elsewhere
        return;
      }
      toast.error({ message: errorMessage });
    }
  }, [updateError]);

  useEffect(() => {
    if (updateStatus === 'success' && updateData) {
      setEnabledFeatures(convertEnabledFeaturesObjectToFeatureKeys(updateData.data));
      dispatch(coreActions.fetchApplicationRequest({ app_id: appId }));
      toast.success({ message: intl.formatMessage({ id: 'common.changesSaved' }) });
    }
  }, [appId, dispatch, intl, setEnabledFeatures, updateData, updateStatus]);

  const enabledFeatures = updateData?.data || data?.data;

  return {
    isLoadingEnabledFeatures: status === 'loading' || updateStatus === 'loading',
    enabledFeatures,
    load,
    update,
  };
};
