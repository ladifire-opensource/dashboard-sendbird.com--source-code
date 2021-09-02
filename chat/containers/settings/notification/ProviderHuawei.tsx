import { useEffect, FC } from 'react';
import { useIntl, IntlShape } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';

import { Button, cssVariables, TableColumnProps } from 'feather';

import { coreActions } from '@actions';
import { coreApi } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { useAsync, useShowDialog } from '@hooks';

import { OptionMenu } from './OptionMenu';
import {
  PushPlatform,
  PushPlatformHeader,
  PushPlatformIcon,
  PushPlatformTitle,
  PushPlatformTable,
  ColumnLink,
} from './components';

type ShowProviderRegisterDialog = (
  defaultValues?: PushHuaweiRegisterDialogFormValues,
  pushConfigurationId?: HuaweiProvider['id'],
  push_type?: HuaweiProvider['push_type'],
) => void;

type HuaweiTableRecord = HuaweiProvider;

const getColumns = ({
  intl,
  isEditable,
  isDisabled,
  handleEditClick,
}: {
  intl: IntlShape;
  isEditable: boolean;
  isDisabled?: boolean;
  handleEditClick: (record: HuaweiTableRecord) => void;
}): TableColumnProps<HuaweiTableRecord>[] => {
  const columns: TableColumnProps<HuaweiTableRecord>[] = [
    {
      dataIndex: 'huawei_app_id',
      title: intl.formatMessage({ id: 'chat.settings.notifications.huawei.th.appId' }),
      width: '29.1%',
      render: (record) => {
        if (isEditable) {
          return (
            <ColumnLink onClick={() => handleEditClick(record)} disabled={isDisabled}>
              {record.huawei_app_id}
            </ColumnLink>
          );
        }
        return record.huawei_app_id;
      },
      styles: `
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          word-break: break-all;
        `,
    },
    {
      dataIndex: 'huawei_app_secret',
      title: intl.formatMessage({ id: 'chat.settings.notifications.huawei.th.appSecret' }),
      styles: `
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      `,
    },
    {
      dataIndex: 'push_sound',
      title: intl.formatMessage({ id: 'chat.settings.notifications.apns.th.sound' }),
      width: '21.25%',
      render: ({ push_sound }) => (push_sound ? 'Custom' : 'Default'),
    },
  ];

  return columns;
};

const useHuaweiProvider = (appId) => {
  const [{ data, status }, load] = useAsync(
    () => coreApi.fetchPushConfiguration({ app_id: appId, push_type: 'huawei' }),
    [appId],
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    configurations: data ? (data.data.push_configurations as HuaweiProvider[]) : [],
    load,
    isLoading: status === 'loading',
  };
};

export const ProviderHuawei: FC<{ isEditable: boolean }> = ({ isEditable }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const showDialog = useShowDialog();
  const application = useSelector((state: RootState) => state.applicationState.data);
  const { configurations, isLoading, load } = useHuaweiProvider(application?.app_id);

  if (!application) {
    return null;
  }

  const isSectionDisabled = !application.push_enabled;

  const showProviderRegisterDialog: ShowProviderRegisterDialog = (defaultValues, pushConfigurationId) => {
    showDialog({
      dialogTypes: DialogType.PushHuaweiRegister,
      dialogProps: {
        pushConfigurationId,
        push_type: 'huawei',
        defaultValues,
        onSuccess: () => {
          load();
        },
      },
    });
  };

  const handleEditClick = (record) => {
    showProviderRegisterDialog(record, record.id);
  };
  const handleDeletePushConfigurationClick = (id) => {
    showDialog({
      dialogTypes: DialogType.Confirm,
      dialogProps: {
        title: intl.formatMessage({ id: 'chat.settings.notifications.huawei.dialog.delete.title' }),
        description: intl.formatMessage({
          id: 'chat.settings.notifications.huawei.dialog.delete.description',
        }),
        confirmText: intl.formatMessage({ id: 'label.delete' }),
        confirmType: 'danger',
        onConfirm: () => {
          dispatch(
            coreActions.deletePushConfigurationRequest({
              push_type: 'HUAWEI',
              pushConfigurationId: id,
              onSuccess: () => {
                load();
              },
            }),
          );
        },
      },
    });
  };
  return (
    <PushPlatform>
      <PushPlatformHeader>
        <PushPlatformIcon icon="huawei" size={24} color={cssVariables('neutral-6')} />
        <PushPlatformTitle>{intl.formatMessage({ id: 'chat.settings.notifications.huawei.title' })}</PushPlatformTitle>
        {isEditable && (
          <Button
            buttonType="primary"
            size="small"
            icon="plus"
            disabled={isSectionDisabled || isLoading}
            onClick={() => showProviderRegisterDialog()}
          >
            {intl.formatMessage({ id: 'chat.settings.notifications.button.add_huawei' })}
          </Button>
        )}
      </PushPlatformHeader>
      <PushPlatformTable<HuaweiTableRecord>
        rowKey="FCM"
        columns={getColumns({ intl, isEditable, handleEditClick, isDisabled: isSectionDisabled })}
        dataSource={configurations}
        loading={isLoading}
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
                      onClick: () => handleDeletePushConfigurationClick(record.id),
                    },
                  ]}
                />,
              ]
            : []
        }
      />
    </PushPlatform>
  );
};
