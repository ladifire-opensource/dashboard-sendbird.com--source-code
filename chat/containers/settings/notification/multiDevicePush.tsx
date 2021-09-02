import { FC, useState } from 'react';
import { useIntl } from 'react-intl';

import { toast, Link, LinkVariant } from 'feather';

import { SettingsRadioGrid } from '@common/containers/layout';
import { updatePushSettings } from '@core/api';
import { getErrorMessage } from '@epics';
import { useAsync } from '@hooks';

import { usePushSettingStateUpdater } from './usePushSettingStateUpdater';

type MultiDevicePushProps = {
  application: Application;
};

enum MultiDevicePushType {
  on = 'on',
  off = 'off',
}

const usePushSettingsAPI = () => {
  const [{ status }, submit] = useAsync(async (appId, alwaysPush) => {
    return await updatePushSettings({
      appId,
      update: { always_push: alwaysPush },
    });
  }, []);

  return {
    isLoading: status === 'loading',
    submit,
  };
};

export const MultiDevicePush: FC<MultiDevicePushProps> = ({ application }) => {
  const intl = useIntl();
  const updatePushSettingState = usePushSettingStateUpdater();
  const initialValue = application.attrs.always_push ? MultiDevicePushType.on : MultiDevicePushType.off;
  const [value, setValue] = useState(initialValue);

  const { isLoading, submit } = usePushSettingsAPI();

  const onSubmit = async () => {
    const alwaysPush = value === MultiDevicePushType.on;
    const response = await submit(application.app_id, alwaysPush);

    // FIXME: should be better handling promise
    if (response.status === 200) {
      updatePushSettingState(response.data);
      toast.success({
        message: intl.formatMessage({ id: 'chat.settings.notifications.multiDevice.toast.success' }),
      });
      return;
    }
    toast.error({ message: getErrorMessage(response) });
  };

  const isDisabled = !application.push_enabled;

  return (
    <SettingsRadioGrid<MultiDevicePushType>
      isDisabled={isDisabled}
      title={intl.formatMessage({ id: 'chat.settings.notifications.multiDevice.title' })}
      gap={['0', '32px']}
      isFetching={isLoading}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
      onSave={onSubmit}
      onReset={() => setValue(initialValue)}
      onChange={setValue}
      selectedValue={value}
      initialValue={initialValue}
      radioItems={[
        {
          label: intl.formatMessage({ id: 'chat.settings.notifications.multiDevice.label.off' }),
          description: intl.formatMessage({
            id: 'chat.settings.notifications.multiDevice.description.off',
          }),
          value: MultiDevicePushType.off,
        },
        {
          label: intl.formatMessage({ id: 'chat.settings.notifications.multiDevice.label.on' }),
          description: intl.formatMessage(
            { id: 'chat.settings.notifications.multiDevice.description.on' },
            {
              a: (text) => (
                <Link
                  variant={LinkVariant.Inline}
                  target="_blank"
                  href="https://sendbird.com/docs/chat/v3/android/guides/push-notifications-multi-device-support"
                  disabled={isDisabled}
                >
                  {text}
                </Link>
              ),
            },
          ),
          value: MultiDevicePushType.on,
        },
      ]}
      data-test-id="multiDeviceRadioGrid"
    />
  );
};
