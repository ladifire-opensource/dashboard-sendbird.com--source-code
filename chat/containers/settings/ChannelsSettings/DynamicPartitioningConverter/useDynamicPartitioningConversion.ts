import { useRef, useCallback, useState, useEffect, useMemo } from 'react';

import { CancellableAxiosPromise } from '@api/cancellableAxios';
import { startClassicOpenChannelMigration, fetchClassicOpenChannelMigrationStatus } from '@chat/api';
import { useAuthorization, useAppId } from '@hooks';
import usePageVisibility from '@hooks/usePageVisibility';
import { ClientStorage } from '@utils';

import { useCurrentDynamicPartitioningOption } from '../hooks';
import { useUpdateDynamicPartitioningOption } from '../useUpdateDynamicPartitioningOption';
import { useConvertDialog, useSuccessDialog, useFailureDialog } from './dialogs';

/**
 * - unknown: state was never fetched or it couldn't be fetched due to an error
 * - never: migration never happened
 * - running: migration is ongoing
 * - migrationDone: migration is done
 * - completed: conversion is completed
 * - failed: conversion failed
 * - retrying: a user retried the conversion and it's waiting for the conversion state to be fetched
 */
type ConversionState = 'unknown' | 'never' | 'running' | 'migrationDone' | 'completed' | 'failed' | 'retrying';
type ClassicOpenChannelMigrationStatus = ClassicOpenChannelMigration['status'];

export type DynamicPartitioningConversionState = ConversionState;

const POLLING_INTERVAL = 5000;

/**
 * Conversion request logs are stored in ClientStorage as a collection of AppID-AuthUserID pairs.
 *
 * If a record that matches the current application and user is found, it means a conversion has been requested by the
 * current user so we need to notify success or failure of an ongoing conversion.
 */
const useConversionRequestLog = () => {
  const appId = useAppId();
  const { user_id: userId } = useAuthorization().user;

  return useMemo(() => {
    const isRequestedByCurrentUser = () => {
      try {
        return ClientStorage.getObject('dynamicPartitioningConversionRequests')?.[appId] === userId;
      } catch {
        return false;
      }
    };

    const addLog = () => {
      try {
        ClientStorage.upsertObject('dynamicPartitioningConversionRequests', { [appId]: userId });
      } catch {
        ClientStorage.setObject('dynamicPartitioningConversionRequests', { [appId]: userId });
      }
    };

    const removeLog = () => {
      ClientStorage.removeFromObject('dynamicPartitioningConversionRequests', [appId]);
    };

    return { isRequestedByCurrentUser, addLog, removeLog };
  }, [appId, userId]);
};

// If there is an ongoing conversion, we poll the conversion state periodically to notify the conversion result in real-time.
const useMigrationStatusPolling = () => {
  const appId = useAppId();
  const timeoutIdRef = useRef<number>(-1);
  const [{ isActive, interval }, setPollingState] = useState<{ isActive: boolean; interval: number }>({
    isActive: false,
    interval: 1000,
  });
  const callbackRef = useRef<(value: ClassicOpenChannelMigrationStatus) => void>(() => {});
  const isPageVisible = usePageVisibility();

  const shouldStartPolling = isActive && isPageVisible;

  useEffect(() => {
    if (shouldStartPolling) {
      (function sendRequest() {
        const scheduleNextRequestIfNeeded = () => {
          if (shouldStartPolling) {
            timeoutIdRef.current = window.setTimeout(sendRequest, interval);
          }
        };
        return fetchClassicOpenChannelMigrationStatus({ appId })
          .then(({ data: { status } }) => {
            scheduleNextRequestIfNeeded();

            // Timeout must be set before calling the callback function because the callback will end the polling if needed.
            callbackRef.current(status);
          })
          .catch(() => {
            scheduleNextRequestIfNeeded();
          });
      })();

      return () => {
        window.clearTimeout(timeoutIdRef.current);
      };
    }
    window.clearTimeout(timeoutIdRef.current);
  }, [appId, interval, shouldStartPolling]);

  return useMemo(() => {
    const startPolling = (
      callback: (value: ClassicOpenChannelMigrationStatus) => void,
      interval: number = POLLING_INTERVAL,
    ) => {
      callbackRef.current = callback;
      setPollingState({ isActive: true, interval });
    };

    const endPolling = () => {
      setPollingState((state) => ({ ...state, isActive: false }));
    };

    return { startPolling, endPolling };
  }, []);
};

const useIsPermittedToStartConversion = () => {
  const { isPermitted } = useAuthorization();
  return isPermitted(['application.settings.all']);
};

export const useDynamicPartitioningConversion = () => {
  const { isUsingDynamicPartitioning } = useCurrentDynamicPartitioningOption();
  const [
    { error: updateDynamicPartitioningOptionError },
    updateDynamicPartitioningOption,
  ] = useUpdateDynamicPartitioningOption();
  const isPageVisible = usePageVisibility();
  const [migrationStatus, setMigrationStatus] = useState<ClassicOpenChannelMigrationStatus | undefined>(undefined);
  const [conversionState, setConversionState] = useState<ConversionState>(
    isUsingDynamicPartitioning ? 'completed' : 'unknown',
  );
  const appId = useAppId();
  const { startPolling, endPolling } = useMigrationStatusPolling();
  const showConvertDialog = useConvertDialog();
  const showSuccessDialog = useSuccessDialog();
  const showFailureDialog = useFailureDialog();
  const { addLog, removeLog, isRequestedByCurrentUser } = useConversionRequestLog();
  const fetchMigrationStatusPromiseRef = useRef<CancellableAxiosPromise | null>(null);

  // If the current user cannot start conversion, we don't need to fetch the conversion status and show conversion UI.
  const isPermittedToStartConversion = useIsPermittedToStartConversion();

  const notifyConversionSuccess = useCallback(() => {
    removeLog();
    showSuccessDialog();
  }, [removeLog, showSuccessDialog]);

  useEffect(() => {
    if (isUsingDynamicPartitioning && isRequestedByCurrentUser()) {
      setConversionState('completed');
      notifyConversionSuccess();
    }
  }, [isRequestedByCurrentUser, isUsingDynamicPartitioning, notifyConversionSuccess]);

  useEffect(() => {
    if (updateDynamicPartitioningOptionError) {
      setConversionState('failed');
    }
  }, [updateDynamicPartitioningOptionError]);

  useEffect(() => {
    function loadOpenChannelMigrationStatus() {
      const request = fetchClassicOpenChannelMigrationStatus({ appId });
      fetchMigrationStatusPromiseRef.current = request;

      request
        .then((response) => {
          if (response == null) {
            // ignore canceled requests
            return;
          }
          setMigrationStatus(response.data.status);
        })
        .catch(() => {
          // fallback status when it failed to fetch the conversion status
          setMigrationStatus(isUsingDynamicPartitioning ? 'DONE' : 'NOT_STARTED');
        });

      return request;
    }

    if (!isUsingDynamicPartitioning && isPermittedToStartConversion && conversionState === 'unknown' && isPageVisible) {
      // fetch migration status for the first time
      loadOpenChannelMigrationStatus();

      return () => {
        fetchMigrationStatusPromiseRef.current?.cancel();
      };
    }
  }, [
    migrationStatus,
    isUsingDynamicPartitioning,
    conversionState,
    appId,
    isPageVisible,
    isPermittedToStartConversion,
  ]);

  const requestConversion = useCallback(async () => {
    const {
      data: { status },
    } = await startClassicOpenChannelMigration({ appId });
    addLog();
    setMigrationStatus(status);
  }, [addLog, appId]);

  useEffect(() => {
    const handleMigrationStatusChange = async () => {
      switch (migrationStatus) {
        case 'PENDING':
        case 'PROCESSING':
        case 'SCHEDULED':
          setConversionState('running');
          break;

        case 'CANCELED':
        case 'FAILED':
          setConversionState('failed');
          break;

        case 'NOT_STARTED':
          setConversionState('never');
          break;

        case 'DONE':
          setConversionState('migrationDone');
          break;

        default:
          break;
      }
    };

    handleMigrationStatusChange();
  }, [migrationStatus]);

  const confirmConversion = () => {
    showConvertDialog(async () => {
      await requestConversion();
    });
  };

  useEffect(() => {
    switch (conversionState) {
      case 'running':
        startPolling(setMigrationStatus);
        break;

      case 'migrationDone':
        endPolling();
        updateDynamicPartitioningOption('single_subchannel');
        break;

      case 'failed':
        endPolling();
        if (isRequestedByCurrentUser()) {
          removeLog();
          showFailureDialog(async () => {
            setConversionState('retrying');
            setMigrationStatus(undefined);
            try {
              await requestConversion();
            } catch {
              setConversionState('failed');
            }
          });
        }
        break;

      default:
        break;
    }
  }, [
    conversionState,
    endPolling,
    isRequestedByCurrentUser,
    removeLog,
    requestConversion,
    showFailureDialog,
    startPolling,
    updateDynamicPartitioningOption,
  ]);

  return { confirmConversion, conversionState };
};
