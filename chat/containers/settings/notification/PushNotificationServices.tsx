import { FC, useState, useEffect, useCallback } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { css } from 'styled-components';

import { cssVariables, Button, TableColumnProps, toast } from 'feather';
import startCase from 'lodash/startCase';

import { coreActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { EMPTY_TEXT } from '@constants';
import { fetchPushConfiguration } from '@core/api';
import { getErrorMessage } from '@epics';
import { useShowDialog, useAppId, useShallowEqualSelector } from '@hooks';

import { APNsExpirationDate } from './APNsExpirationDate';
import { OptionMenu } from './OptionMenu';
import { ProviderHuawei } from './ProviderHuawei';
import {
  PushPlatforms,
  PushPlatform,
  PushPlatformHeader,
  PushPlatformIcon,
  PushPlatformTitle,
  PushPlatformTable,
  ColumnLink,
} from './components';

type PushType = APNs['push_type'] | FCM['push_type'] | GCM['push_type'];

type ShowAPNSRegisterDialog = (
  defaultValues?: Omit<PushAPNSRegisterDialogFormValues, 'apnsFile' | 'apnsCertPassword'>,
  configuration?: APNs,
) => void;

type ShowFCMRegisterDialog = (
  defaultValues?: PushFCMRegisterDialogFormValues,
  pushConfigurationId?: (FCM | GCM)['id'],
  push_type?: (FCM | GCM)['push_type'],
) => void;

type FCMTableRecord = {
  id: string;
  push_type: (FCM | GCM)['push_type'];
  sender_id: string;
  api_key: string;
  push_sound: (FCM | GCM)['push_sound'];
};

type Props = {
  isEditable: boolean;
};

const fcmPushTypes = ['fcm', 'gcm'] as const;

const getAPNsColumns = ({
  intl,
  isEditable,
  isDisabled,
  handleEditClick,
}: {
  intl: IntlShape;
  isEditable: boolean;
  isDisabled: boolean;
  handleEditClick: (record: APNs) => void;
}): TableColumnProps<APNs>[] => {
  const renderOnOff = (value: boolean) =>
    intl.formatMessage({
      id: value ? 'chat.settings.notifications.apns.on' : 'chat.settings.notifications.apns.off',
    });

  return [
    {
      dataIndex: 'apns_name',
      title: intl.formatMessage({ id: 'chat.settings.notifications.apns.th.name' }),
      styles: `
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        word-break: break-all;
      `,
      render: (record) => {
        if (isEditable) {
          return (
            <ColumnLink onClick={() => handleEditClick(record)} disabled={isDisabled}>
              {record.apns_name}
            </ColumnLink>
          );
        }
        return record.apns_name;
      },
    },
    {
      dataIndex: 'push_type',
      title: intl.formatMessage({ id: 'chat.settings.notifications.apns.th.sslCertificateType' }),
      width: 135,
      render: ({ apns_type }) => startCase(apns_type.toLowerCase()),
    },
    {
      dataIndex: 'push_sound',
      title: intl.formatMessage({ id: 'chat.settings.notifications.apns.th.sound' }),
      width: 57,
      render: ({ push_sound }) => (push_sound ? 'Custom' : 'Default'),
    },
    {
      dataIndex: 'has_unread_count_badge',
      title: intl.formatMessage({ id: 'chat.settings.notifications.apns.th.badge' }),
      width: 57,
      render: ({ has_unread_count_badge }) => renderOnOff(Boolean(has_unread_count_badge)),
    },
    {
      dataIndex: 'mutable_content',
      title: intl.formatMessage({ id: 'chat.settings.notifications.apns.th.mutableContent' }),
      width: 126,
      render: ({ mutable_content }) => renderOnOff(mutable_content),
    },
    {
      dataIndex: 'content_available',
      title: intl.formatMessage({ id: 'chat.settings.notifications.apns.th.contentAvailable' }),
      width: 127,
      render: ({ content_available }) => renderOnOff(content_available),
    },
    {
      dataIndex: 'apns_expiration',
      title: intl.formatMessage({ id: 'chat.settings.notifications.apns.th.expiration' }),
      width: 163,
      styles: 'padding-right: 40px',
      render: ({ apns_expiration }) => {
        const millisecondTimestamp = String(apns_expiration).length === 10 ? apns_expiration * 1000 : apns_expiration;
        return (
          <APNsExpirationDate
            timestamp={millisecondTimestamp}
            color={isDisabled ? cssVariables('neutral-5') : undefined}
          />
        );
      },
    },
  ];
};

const getFCMColumns = ({
  intl,
  isEditable,
  isDisabled,
  handleEditClick,
}: {
  intl: IntlShape;
  isEditable: boolean;
  isDisabled?: boolean;
  handleEditClick: (record: FCMTableRecord) => void;
}): TableColumnProps<FCMTableRecord>[] => {
  const columns: TableColumnProps<FCMTableRecord>[] = [
    {
      dataIndex: 'api_key',
      flex: 1,
      title: intl.formatMessage({ id: 'chat.settings.notifications.fcm.th.apiKey' }),
      render: (record) => {
        if (isEditable) {
          return (
            <ColumnLink onClick={() => handleEditClick(record)} disabled={isDisabled}>
              {record.api_key}
            </ColumnLink>
          );
        }
        return record.api_key;
      },
      styles: `
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          word-break: break-all;
        `,
    },
    {
      dataIndex: 'sender_id',
      width: '24%',
      title: intl.formatMessage({ id: 'chat.settings.notifications.fcm.th.senderId' }),
      render: (record) => record.sender_id || EMPTY_TEXT,
      styles: `
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      `,
    },
    {
      dataIndex: 'push_sound',
      title: intl.formatMessage({ id: 'chat.settings.notifications.apns.th.sound' }),
      width: '21.52%',
      render: ({ push_sound }) => (push_sound ? 'Custom' : 'Default'),
    },
  ];

  return columns;
};

const isGCM = (fcmOrGcm: FCM | GCM): fcmOrGcm is GCM => {
  return !!(fcmOrGcm as GCM).gcm_sender_id;
};

export const PushNotificationServices: FC<Props> = ({ isEditable }) => {
  const { isLoadingApplication, isPushEnabled } = useShallowEqualSelector((state) => {
    const isLoadingApplication = state.applicationState.data == null;
    const isPushEnabled = state.applicationState.data?.push_enabled;
    return { isLoadingApplication, isPushEnabled };
  });
  const appId = useAppId();
  const dispatch = useDispatch();
  const showDialog = useShowDialog();

  const intl = useIntl();
  const [isFetchingAPNS, setIsFetchingAPNS] = useState(false);
  const [isFetchingFCM, setIsFetchingFCM] = useState(false);
  const [apns, setAPNS] = useState<APNs[]>([]);
  const [fcm, setFCM] = useState<(FCM | GCM)[]>([]);

  const deletePushConfiguration = (payload) => dispatch(coreActions.deletePushConfigurationRequest(payload));

  const fetchAPNS = useCallback(async () => {
    if (isLoadingApplication) {
      return;
    }
    setIsFetchingAPNS(true);

    try {
      const { data } = await fetchPushConfiguration({ app_id: appId, push_type: 'apns' });
      setAPNS(data.push_configurations as APNs[]);
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
    } finally {
      setIsFetchingAPNS(false);
    }
  }, [appId, isLoadingApplication]);

  const fetchFCM = useCallback(async () => {
    if (isLoadingApplication) {
      return;
    }
    let fcmResponse: (FCM | GCM)[] = [];
    setIsFetchingFCM(true);

    try {
      for (const pushType of fcmPushTypes) {
        const response = await fetchPushConfiguration({ app_id: appId, push_type: pushType });
        fcmResponse = fcmResponse.concat(response.data.push_configurations);
      }
      setFCM(fcmResponse);
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
    } finally {
      setIsFetchingFCM(false);
    }
  }, [appId, isLoadingApplication]);

  useEffect(() => {
    fetchAPNS();
  }, [fetchAPNS]);

  useEffect(() => {
    fetchFCM();
  }, [fetchFCM]);

  const showAPNSRegisterDialog: ShowAPNSRegisterDialog = (defaultValues, configuration) => {
    showDialog({
      dialogTypes: DialogType.PushApnsRegister,
      dialogProps: {
        configuration,
        defaultValues,
        onSuccess: fetchAPNS,
      },
    });
  };

  const showFCMRegisterDialog: ShowFCMRegisterDialog = (defaultValues, pushConfigurationId, push_type) => {
    showDialog({
      dialogTypes: DialogType.PushFcmRegister,
      dialogProps: {
        pushConfigurationId,
        push_type: push_type?.toLowerCase() as PushFCMRegisterDialogProps['push_type'],
        defaultValues,
        onSuccess: fetchFCM,
      },
    });
  };

  const handleEditClick = (record: APNs | FCMTableRecord) => {
    if (record.push_type.includes('APNS')) {
      const {
        apns_env_cert_type,
        content_available: contentAvailable,
        mutable_content: mutableContent,
        has_unread_count_badge,
        push_sound,
      } = record as APNs;
      showAPNSRegisterDialog(
        {
          apnsEnvType: apns_env_cert_type as PushConfigurationType,
          hasUnreadCountBadge: !!has_unread_count_badge,
          mutableContent,
          contentAvailable,
          pushSound: push_sound ?? '',
        },
        record as APNs,
      );
      return;
    }
    const { id, push_type, sender_id: senderId, api_key: apiKey, push_sound } = record as FCMTableRecord;
    showFCMRegisterDialog(
      {
        senderId,
        apiKey,
        pushSound: push_sound ?? '',
      },
      id,
      push_type,
    );
    return;
  };

  const handleDeletePushConfigurationClick = (push_type: PushType, id: string) => () => {
    showDialog({
      dialogTypes: DialogType.Confirm,
      dialogProps: {
        title: push_type.includes('APNS')
          ? intl.formatMessage({ id: 'core.settings.application.notification.apns.dialog.delete.title' })
          : intl.formatMessage({ id: 'chat.settings.notifications.fcm.deleteDialog.title' }),
        description: push_type.includes('APNS')
          ? intl.formatMessage({ id: 'core.settings.application.notification.apns.dialog.delete.description' })
          : intl.formatMessage({ id: 'chat.settings.notifications.fcm.deleteDialog.desc' }),
        confirmText: intl.formatMessage({ id: 'label.delete' }),
        confirmType: 'danger',
        onConfirm: () => {
          deletePushConfiguration({
            push_type,
            pushConfigurationId: id,
            onSuccess: () => {
              fetchAPNS();
              fetchFCM();
            },
          });
        },
      },
    });
  };

  if (isLoadingApplication) {
    return null;
  }

  const isSectionDisabled = !isPushEnabled;

  return (
    <PushPlatforms aria-disabled={isSectionDisabled}>
      <PushPlatform>
        <PushPlatformHeader>
          <PushPlatformIcon icon="apple" size={24} color={cssVariables('neutral-6')} />
          <PushPlatformTitle>{intl.formatMessage({ id: 'chat.settings.notifications.apns.title' })}</PushPlatformTitle>
          {isEditable && (
            <Button
              buttonType="primary"
              size="small"
              icon="plus"
              disabled={isSectionDisabled || isFetchingAPNS}
              onClick={() => showAPNSRegisterDialog()}
            >
              {intl.formatMessage({ id: 'chat.settings.notifications.button.add_apns' })}
            </Button>
          )}
        </PushPlatformHeader>
        <PushPlatformTable<APNs>
          rowKey="APNS"
          columns={getAPNsColumns({ intl, isEditable, handleEditClick, isDisabled: isSectionDisabled })}
          dataSource={apns}
          loading={isFetchingAPNS}
          rowStyles={() => css`
            min-height: 72px;
          `}
          rowActions={(record) =>
            isEditable
              ? [
                  <OptionMenu
                    key="menu"
                    disabled={isSectionDisabled}
                    items={[
                      {
                        label: intl.formatMessage({ id: 'core.settings.application.notification.actions.edit' }),
                        onClick: () => {
                          handleEditClick(record);
                        },
                      },
                      {
                        label: intl.formatMessage({ id: 'core.settings.application.notification.actions.delete' }),
                        onClick: handleDeletePushConfigurationClick(record.push_type, record.id),
                      },
                    ]}
                  />,
                ]
              : []
          }
        />
      </PushPlatform>
      <PushPlatform aria-labelledby="fcm-section-title">
        <PushPlatformHeader>
          <PushPlatformIcon icon="android" size={24} color={cssVariables('neutral-6')} />
          <PushPlatformTitle id="fcm-section-title">
            {intl.formatMessage({ id: 'core.settings.application.notification.fcm.title' })}
          </PushPlatformTitle>
          {isEditable && (
            <Button
              buttonType="primary"
              size="small"
              icon="plus"
              disabled={!isPushEnabled || isFetchingFCM}
              onClick={() => showFCMRegisterDialog()}
            >
              {intl.formatMessage({ id: 'chat.settings.notifications.button.add_fcm' })}
            </Button>
          )}
        </PushPlatformHeader>
        <PushPlatformTable<FCMTableRecord>
          rowKey="FCM"
          columns={getFCMColumns({ intl, isEditable, isDisabled: isSectionDisabled, handleEditClick })}
          dataSource={fcm.map((fcmItem) => {
            if (isGCM(fcmItem)) {
              return {
                id: fcmItem.id,
                push_type: fcmItem.push_type,
                sender_id: fcmItem.gcm_sender_id,
                api_key: fcmItem.gcm_api_key,
                push_sound: fcmItem.push_sound,
              };
            }
            return {
              id: fcmItem.id,
              push_type: fcmItem.push_type,
              sender_id: '',
              api_key: fcmItem.api_key,
              push_sound: fcmItem.push_sound,
            };
          })}
          loading={isFetchingFCM}
          rowActions={(record) =>
            isEditable
              ? [
                  <OptionMenu
                    key="menu"
                    disabled={isSectionDisabled}
                    items={[
                      {
                        label: intl.formatMessage({ id: 'core.settings.application.notification.actions.edit' }),
                        onClick: () => {
                          handleEditClick(record);
                        },
                      },
                      {
                        label: intl.formatMessage({ id: 'core.settings.application.notification.actions.delete' }),
                        onClick: handleDeletePushConfigurationClick(record.push_type, record.id),
                      },
                    ]}
                  />,
                ]
              : []
          }
        />
      </PushPlatform>
      <ProviderHuawei isEditable={isEditable} />
    </PushPlatforms>
  );
};
