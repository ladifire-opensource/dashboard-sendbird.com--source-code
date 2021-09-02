import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { coreActions } from '@actions';
import { useTypedSelector } from '@hooks';

export const usePushSettingStateUpdater = () => {
  const dispatch = useDispatch();
  const application = useTypedSelector((state) => state.applicationState.data);
  const updatePushSettingState = useCallback(
    (updates: Partial<PushSettings>) => {
      if (!application) {
        return;
      }

      let newApplication = application;

      if (updates.always_push != null) {
        newApplication = { ...newApplication, attrs: { ...newApplication.attrs, always_push: updates.always_push } };
      }

      if (updates.include_channel_unread_count != null) {
        newApplication = {
          ...newApplication,
          attrs: {
            ...newApplication.attrs,
            push_payload: {
              ...newApplication.attrs.push_payload,
              include_channel_unread_count: updates.include_channel_unread_count,
            },
          },
        };
      }

      dispatch(coreActions.fetchApplicationSuccess(newApplication));
    },
    [application, dispatch],
  );
  return updatePushSettingState;
};
