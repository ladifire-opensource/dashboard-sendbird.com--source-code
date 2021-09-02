import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { coreActions } from '@actions';
import { updateOpenChannelDynamicPartitioningOption } from '@core/api';
import { useAppId } from '@hooks';

export const useUpdateDynamicPartitioningOption = () => {
  const appId = useAppId();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const updateDynamicPartitioningOption = useCallback(
    async (value: DynamicPartitioningOption) => {
      try {
        setIsLoading(true);
        const { data } = await updateOpenChannelDynamicPartitioningOption({ appId, option_type: value });
        dispatch(coreActions.updateApplicationAttributes(data));
        setError(null);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [appId, dispatch],
  );

  return [{ isLoading, error }, updateDynamicPartitioningOption] as const;
};
