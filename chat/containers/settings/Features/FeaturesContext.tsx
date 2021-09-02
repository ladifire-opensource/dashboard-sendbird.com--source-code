import { createContext, ComponentProps, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { Toggle } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useFeatureName } from '@common/hooks';
import {
  SubscriptionProduct,
  ChatFeatureName,
  MessageSearchPipelineMigrationStatus,
  MessageSearchPipelineSubscriptionStatus,
} from '@constants';
import { useShowDialog } from '@hooks';
import { useCurrentSubscription } from '@hooks/useCurrentSubscription';
import { useEnabledFeatures } from '@hooks/useEnabledFeatures';
import { useMessageSearchPipeline } from '@hooks/useMessageSearchPipeline';

export const FeaturesContext = createContext<{
  isLoadingEnabledFeatures: boolean;
  enabledFeatures?: EnabledFeatures;
  update: (payload: any) => void;
  toggleFeature: (feature: ChatFeature) => ComponentProps<typeof Toggle>['onClick'];
  currentSubscription: Subscription | null;
  messageSearchPipeline: {
    isInitial: boolean;
    isLive: boolean;
    subscribed: boolean;
    migrationErrored: boolean;
    migrationScheduled: boolean;
    migrationExecuting: boolean;
    doingHistoryMigration: boolean;
    waitingForMigrationStopped: boolean;
    preventShowPercent: boolean;
  };
}>({
  isLoadingEnabledFeatures: false,
  enabledFeatures: {} as EnabledFeatures,
  update: () => {},
  toggleFeature: () => () => {},
  currentSubscription: null,
  messageSearchPipeline: {
    isInitial: true,
    isLive: false,
    subscribed: false,
    migrationErrored: false,
    migrationScheduled: false,
    migrationExecuting: false,
    doingHistoryMigration: false,
    waitingForMigrationStopped: false,
    preventShowPercent: false,
  },
});

export const FeaturesContextProvider = ({ children }) => {
  const intl = useIntl();

  const loadMessagePipelineRef = useRef<number>(-1);

  const application = useSelector((state: RootState) => state.applicationState.data);
  const { isLoadingEnabledFeatures, enabledFeatures, load: loadEnabledFeatures, update } = useEnabledFeatures(
    application?.app_id,
  );
  const { currentSubscription } = useCurrentSubscription(SubscriptionProduct.Chat);
  const getFeatureName = useFeatureName();

  const {
    status: messagePipelineStatus,
    load: loadMessagePipelineData,
    data: messageSearchPipelineData,
  } = useMessageSearchPipeline();

  const migrationErrored =
    messageSearchPipelineData?.migration_status === MessageSearchPipelineMigrationStatus.MigrationErrored;
  const doingHistoryMigration =
    !messageSearchPipelineData?.is_live &&
    (messageSearchPipelineData?.migration_status === MessageSearchPipelineMigrationStatus.Scheduled ||
      messageSearchPipelineData?.migration_status === MessageSearchPipelineMigrationStatus.Executing);
  const waitingForMigrationStopped =
    messageSearchPipelineData?.migration_status !== MessageSearchPipelineMigrationStatus.Stopped &&
    messageSearchPipelineData?.subscription_status === MessageSearchPipelineSubscriptionStatus.Unsubscribed;

  useEffect(() => {
    if (messagePipelineStatus === 'success' && (doingHistoryMigration || waitingForMigrationStopped)) {
      if (loadMessagePipelineRef.current !== -1) {
        window.clearInterval(loadMessagePipelineRef.current);
      }
      const setIntervalId = window.setInterval(loadMessagePipelineData, 3000);
      loadMessagePipelineRef.current = setIntervalId;
      return () => {
        window.clearInterval(setIntervalId);
      };
    }
  }, [messagePipelineStatus, waitingForMigrationStopped, doingHistoryMigration, loadMessagePipelineData]);

  useEffect(() => {
    // make sure no setInterval running after unmount
    return () => {
      if (loadMessagePipelineRef.current !== -1) {
        window.clearInterval(loadMessagePipelineRef.current);
      }
    };
  }, []);

  const showConfirmDialog = useShowDialog();

  const toggleFeature = (feature: ChatFeature) => (checked, e) => {
    e.stopPropagation();

    const featureName = getFeatureName({ featureKey: feature.key });

    const title = checked
      ? intl.formatMessage({ id: 'chat.settings.features.confirmDialog.title.on' }, { featureName })
      : intl.formatMessage({ id: 'chat.settings.features.confirmDialog.title.off' }, { featureName });

    const description = checked
      ? intl.formatMessage(
          { id: 'chat.settings.features.confirmDialog.description.on' },
          { featureName, applicationName: application?.app_name },
        )
      : intl.formatMessage(
          { id: 'chat.settings.features.confirmDialog.description.off' },
          { featureName, applicationName: application?.app_name },
        );

    showConfirmDialog({
      dialogTypes: DialogType.Confirm,
      dialogProps: {
        title,
        description,
        onConfirm: async (setIsPending) => {
          setIsPending(true);
          const response = await update({
            [feature.key]: checked,
          });
          if (feature.key === ChatFeatureName.MessageSearch) {
            if ((response as any).status !== 200) {
              if (Object.prototype.hasOwnProperty.call((response as any).data.detail, 'subscription_status')) {
                await loadEnabledFeatures();
                await loadMessagePipelineData();
                // TODO: Pipeline and Enabled features sync broken
                // It can be happen when turn on/off feature that already turned on/off
                // throw Error('Message search already turned on.');
              }
              // FIXME: revamp API responses
              if ((response as any).data.detail.message) {
                throw Error((response as any).data.detail.message);
              }
            }
            await loadMessagePipelineData();
          }
          setIsPending(false);
        },
        confirmText: 'OK',
      },
    });
  };

  return (
    <FeaturesContext.Provider
      value={{
        isLoadingEnabledFeatures,
        enabledFeatures,
        update,
        toggleFeature,
        currentSubscription,
        messageSearchPipeline: {
          isInitial: !messageSearchPipelineData,
          isLive: messageSearchPipelineData?.is_live ?? false,
          subscribed:
            messageSearchPipelineData?.subscription_status === MessageSearchPipelineSubscriptionStatus.Subscribed,
          migrationScheduled:
            messageSearchPipelineData?.migration_status === MessageSearchPipelineMigrationStatus.Scheduled,
          migrationExecuting:
            messageSearchPipelineData?.migration_status === MessageSearchPipelineMigrationStatus.Executing,
          migrationErrored,
          doingHistoryMigration,
          waitingForMigrationStopped,
          preventShowPercent: !messageSearchPipelineData || migrationErrored || doingHistoryMigration,
        },
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
};
