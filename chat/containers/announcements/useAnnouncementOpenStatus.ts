import { useEffect, useState, useCallback } from 'react';

import { toast } from 'feather';

import { getAnnouncementOpenStatus } from '@chat/api';
import { getErrorMessage } from '@epics';
import { useLatestValue } from '@hooks';
import { ResolveType } from '@utils';

import { downloadAsCSV } from './downloadAsCSV';

type ResponseData = ResolveType<ReturnType<typeof getAnnouncementOpenStatus>>['data'];

const downloadCSV = (eventId: string, openStatus: ResponseData['open_status']) => {
  downloadAsCSV(
    [
      ['user_id', 'channel_url', 'has_opened'],
      ...openStatus.map(({ user_id, channel_url, has_opened }) => [user_id, channel_url, Number(has_opened)]),
    ],
    `announcement_open_status_${eventId}`,
  );
};

export const useAnnouncementOpenStatus = (appId: string, eventId: string) => {
  const [data, setData] = useState<ResponseData>({ open_status: [], next: '' });
  const [isPreparingCSV, setPreparingCSV] = useState(false);
  const latestState = useLatestValue({ data, isPreparingCSV });

  useEffect(() => {
    const getFirstAnnouncementOpenStatus = async () => {
      try {
        const { data } = await getAnnouncementOpenStatus({ appId, eventId, limit: 1 });
        setData(data);
      } catch (error) {
        // Announcement open status becomes unavailable after 1 month after the running schedule.
      }
    };

    getFirstAnnouncementOpenStatus();
  }, [appId, eventId]);

  const download = useCallback(async () => {
    const { current: currentState } = latestState;
    if (currentState.isPreparingCSV) {
      return;
    }

    if (!currentState.data.next) {
      // no more data to fetch
      downloadCSV(eventId, currentState.data.open_status);
      return;
    }

    setPreparingCSV(true);
    const results = [...currentState.data.open_status];
    let token = currentState.data.next;

    try {
      while (token) {
        const { data } = await getAnnouncementOpenStatus({ appId, eventId, token, limit: 100 });
        results.push(...data.open_status);
        token = data.next;
      }
      downloadCSV(eventId, results);
      setData({ open_status: results, next: '' });
    } catch (error) {
      toast.error({ message: getErrorMessage(error) });
    } finally {
      setPreparingCSV(false);
    }
  }, [appId, eventId, latestState]);

  return { isAvailable: (data?.open_status.length ?? 0) > 0, isPreparingCSV, download };
};
