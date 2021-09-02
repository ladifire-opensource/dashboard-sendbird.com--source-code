import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { updateAnnouncement, cancelAnnouncement_LEGACY, abortAnnouncement_LEGACY } from '@chat/api';
import { useAppId } from '@hooks';

import { useAnnouncementVersion } from './useAnnouncementVersion';

export class UnexpectedAnnouncementStatusError extends Error {}

/**
 * Returns a function that performs an AnnouncementAction given the id of an announcement and an action name
 *
 * @param updateListItem callback that updates an existing item of announcement list
 * @returns A function that performs an AnnouncementAction. Returns the updated resource if succeeded. Returns undefined
 * if the request was canceled.
 */
export const useAnnouncementActions = (updateListItem: (item: AnnouncementUnknownVersion) => void) => {
  const appId = useAppId();
  const announcementVersion = useAnnouncementVersion();
  const intl = useIntl();

  const runAnnouncementAction = useCallback(
    async (uniqueId: string, action: AnnouncementAction) => {
      try {
        const { data } = await updateAnnouncement({ appId, id: uniqueId, payload: { action } });
        return data;
      } catch (error) {
        const { code, message = '' } = (error?.data ?? {}) as { code: number; message: string };
        const messageMatchArray = message.match(
          /Announcement status has to be ([a-z\-]+) to perform action "([a-z]+)". \(Current status: ([a-z\-]+)\)/,
        );
        if (code === 400920 && messageMatchArray) {
          const [, , action, currentStatus] = messageMatchArray;
          if (action === 'cancel') {
            throw new UnexpectedAnnouncementStatusError(
              intl.formatMessage({
                id:
                  currentStatus === 'canceled'
                    ? 'chat.announcements.detail.action.cancel.error.alreadyCanceled'
                    : 'chat.announcements.detail.action.cancel.error.alreadyStarted',
              }),
            );
          }
          throw new UnexpectedAnnouncementStatusError(message);
        }
        throw error;
      }
    },
    [appId, intl],
  );

  return useCallback(
    async (uniqueId: string, action: AnnouncementActionV16) => {
      const request = (() => {
        switch (action) {
          case 'pause':
          case 'resume':
            if (announcementVersion !== 'v1.0') {
              // pause and resume are not supported in v1.0.
              return runAnnouncementAction(uniqueId, action);
            }
            break;

          case 'cancel':
            if (announcementVersion === 'v1.0') {
              return (async () => {
                const { data } = await cancelAnnouncement_LEGACY({ appId, eventId: uniqueId });
                return data;
              })();
            }
            if (announcementVersion === 'v1.5') {
              return runAnnouncementAction(uniqueId, 'remove');
            }
            return runAnnouncementAction(uniqueId, 'cancel');

          case 'stop':
            if (announcementVersion === 'v1.0') {
              return (async () => {
                const { data } = await abortAnnouncement_LEGACY({ appId, eventId: uniqueId });
                return data;
              })();
            }
            if (announcementVersion === 'v1.5') {
              return runAnnouncementAction(uniqueId, 'cancel');
            }
            return runAnnouncementAction(uniqueId, 'stop');

          default:
            break;
        }
      })();

      if (request == null) {
        return;
      }

      const updatedAnnouncement = await request;
      updateListItem(updatedAnnouncement);

      return updatedAnnouncement;
    },
    [announcementVersion, appId, runAnnouncementAction, updateListItem],
  );
};
