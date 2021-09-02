import { useEffect, useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';

import { toast } from 'feather';

import { fetchDataExport } from '@chat/api';
import { useAppId, useLatestValue } from '@hooks';

import { mapDataExportStatus, DataExportUIStatus } from './mapDataExportStatus';
import { useDataExport } from './useDataExport';

/** statuses that can change afterwaard (e.g. scheduled, exporting -> can be finished/failed someday) */
const temporaryStatuses: readonly DataExport['status'][] = ['exporting', 'scheduled'];

const delay = (timeout: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, timeout);
  });

export const useAutoRefreshDataExportItems = (
  observedItems: DataExport[],
  onItemUpdated?: (item: DataExport) => void,
) => {
  const intl = useIntl();
  const isUnmountedRef = useRef(false);
  const ongoingRequests = useRef<Record<string, Promise<any>>>({});
  const appId = useAppId();

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  const {
    actions: { updateItem },
  } = useDataExport();

  const defaultOnItemUpdated = useCallback(
    (item: DataExport) => {
      updateItem(item);
      if (item.status === 'size exceeded') {
        toast.error({
          message: intl.formatMessage({ id: 'chat.dataExport.noti.sizeExceeded' }),
          autoHide: false,
          actions: [{ label: intl.formatMessage({ id: 'chat.dataExport.noti.btn.ok' }), closeToastOnClick: true }],
        });
      } else if (mapDataExportStatus(item.status, item.file) === DataExportUIStatus.Failed) {
        toast.error({
          message: intl.formatMessage({ id: 'chat.dataExport.noti.failed' }),
          autoHide: false,
          actions: [{ label: intl.formatMessage({ id: 'chat.dataExport.noti.btn.ok' }), closeToastOnClick: true }],
        });
      }
    },
    [intl, updateItem],
  );

  const latestOnItemUpdated = useLatestValue(onItemUpdated || defaultOnItemUpdated);

  useEffect(() => {
    observedItems
      .filter((item) => temporaryStatuses.includes(item.status))
      .filter((item) => !ongoingRequests.current[item.request_id])
      .forEach((item) => {
        ongoingRequests.current[item.request_id] = (async function createPromise() {
          await delay(3000);
          if (isUnmountedRef.current) {
            return;
          }

          try {
            const response = await fetchDataExport({
              app_id: appId,
              data_type: item.data_type,
              request_id: item.request_id,
            });

            if (response == null || isUnmountedRef.current) {
              // ignore canceled requests and response after unmount
              return;
            }

            const { data } = response;
            latestOnItemUpdated.current(data);

            if (temporaryStatuses.includes(data.status)) {
              // continue observing the item
              ongoingRequests.current[item.request_id] = createPromise();
            } else {
              // stop observing the item
              delete ongoingRequests.current[item.request_id];
            }
          } catch (error) {
            // retry after the interval
            ongoingRequests.current[item.request_id] = createPromise();
          }
        })();
      });
  }, [appId, latestOnItemUpdated, observedItems]);

  useEffect(() => {
    return () => {
      // cancel pending requests
      Object.values(ongoingRequests).forEach((value) => {
        if (typeof value?.cancel === 'function') {
          value.cancel();
        }
      });
    };
  }, []);
};
