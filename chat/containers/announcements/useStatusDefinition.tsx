import { ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { useAnnouncementVersion } from './useAnnouncementVersion';

type AnnouncementStatusAllVersion = AnnouncementV10['status'] | AnnouncementV15['status'] | AnnouncementV16['status'];

export const useStatusDefinition = (isDetailInfoSection?: boolean): Record<AnnouncementStatusAllVersion, ReactNode> => {
  const intl = useIntl();
  const announcementVersion = useAnnouncementVersion();

  return useMemo(() => {
    const v16StatusDefinition: Record<AnnouncementV16['status'], ReactNode> = isDetailInfoSection
      ? {
          scheduled: intl.formatMessage({ id: 'chat.announcements.detail.info.status.description.scheduled' }),
          canceled: intl.formatMessage({ id: 'chat.announcements.detail.info.status.description.canceled' }),
          running: intl.formatMessage({ id: 'chat.announcements.detail.info.status.description.running' }),
          stopped: intl.formatMessage({ id: 'chat.announcements.detail.info.status.description.stopped' }),
          paused: intl.formatMessage({ id: 'chat.announcements.detail.info.status.description.paused' }),
          'on-hold': intl.formatMessage(
            { id: 'chat.announcements.detail.info.status.description.onHold' },
            { b: (text) => <b>{text}</b> },
          ),
          completed: intl.formatMessage({ id: 'chat.announcements.detail.info.status.description.completed' }),
          incompleted: intl.formatMessage(
            { id: 'chat.announcements.detail.info.status.description.incompleted' },
            { b: (text) => <b>{text}</b> },
          ),
        }
      : {
          scheduled: intl.formatMessage({ id: 'chat.announcements.status.scheduled.description' }),
          canceled: intl.formatMessage({ id: 'chat.announcements.status.canceled.description' }),
          running: intl.formatMessage({ id: 'chat.announcements.status.running.description' }),
          stopped: intl.formatMessage({ id: 'chat.announcements.status.stopped.description' }),
          paused: intl.formatMessage({ id: 'chat.announcements.status.paused.description' }),
          'on-hold': intl.formatMessage(
            { id: 'chat.announcements.status.onHold.description' },
            { b: (text) => <b>{text}</b> },
          ),
          completed: intl.formatMessage({ id: 'chat.announcements.status.completed.description' }),
          incompleted: intl.formatMessage({ id: 'chat.announcements.status.incompleted.description' }),
        };

    const statusDefinition: Record<AnnouncementStatusAllVersion, ReactNode> = {
      ...v16StatusDefinition,
      removed: v16StatusDefinition.canceled, // Status renamed: Canceled (v1.0, v1.6) = Removed (v1.5)
      aborted: v16StatusDefinition.stopped, // Status renamed: Stopped (v1.6) = Aborted (v1.0)
      done: v16StatusDefinition.completed, // Status renamed: Completed (v1.5, v1.6) = Done (v1.0)
    };

    if (announcementVersion === 'v1.5') {
      // Status renamed: Canceled(v1.0, 1.6) = Removed(v1.5), Stopped(v1.6) = Canceled(v1.5)
      return {
        ...statusDefinition,
        removed: statusDefinition.canceled,
        canceled: statusDefinition.stopped,
      };
    }

    return statusDefinition;
  }, [announcementVersion, intl, isDetailInfoSection]);
};

export const useStatusLabels = (): Record<AnnouncementStatusAllVersion, string> => {
  const intl = useIntl();
  return useMemo(() => {
    return {
      scheduled: intl.formatMessage({ id: 'chat.announcements.status.scheduled' }),
      canceled: intl.formatMessage({ id: 'chat.announcements.status.canceled' }),
      running: intl.formatMessage({ id: 'chat.announcements.status.running' }),
      stopped: intl.formatMessage({ id: 'chat.announcements.status.stopped' }),
      paused: intl.formatMessage({ id: 'chat.announcements.status.paused' }),
      'on-hold': intl.formatMessage({ id: 'chat.announcements.status.onHold' }),
      completed: intl.formatMessage({ id: 'chat.announcements.status.completed' }),
      incompleted: intl.formatMessage({ id: 'chat.announcements.status.incompleted' }),
      aborted: intl.formatMessage({ id: 'chat.announcements.status.aborted' }),
      done: intl.formatMessage({ id: 'chat.announcements.status.done' }),
      removed: intl.formatMessage({ id: 'chat.announcements.status.removed' }),
    };
  }, [intl]);
};

export const useStatusDefinitionList = (): [string, ReactNode][] => {
  const announcementVersion = useAnnouncementVersion();
  const labels = useStatusLabels();
  const statusDefinition = useStatusDefinition();

  if (announcementVersion === 'v1.0') {
    // Paused, Incompleted, On-hold are hidden.
    // Status renamed: Stopped (v1.6) = Aborted (v1.0), Completed (v1.5, v1.6) = Done (v1.0)
    return [
      [labels.scheduled, statusDefinition.scheduled],
      [labels.canceled, statusDefinition.canceled],
      [labels.running, statusDefinition.running],
      [labels.aborted, statusDefinition.stopped],
      [labels.done, statusDefinition.completed],
    ];
  }

  if (announcementVersion === 'v1.5') {
    // On-hold is hidden.
    // Status renamed: Canceled (v1.0, v1.6) = Removed (v1.5), Stopped(v1.6) = Canceled(v1.5)
    return [
      [labels.scheduled, statusDefinition.scheduled],
      [labels.removed, statusDefinition.canceled],
      [labels.running, statusDefinition.running],
      [labels.canceled, statusDefinition.stopped],
      [labels.paused, statusDefinition.paused],
      [labels.completed, statusDefinition.completed],
      [labels.incompleted, statusDefinition.incompleted],
    ];
  }

  return [
    [labels.scheduled, statusDefinition.scheduled],
    [labels.canceled, statusDefinition.canceled],
    [labels.running, statusDefinition.running],
    [labels.stopped, statusDefinition.stopped],
    [labels.paused, statusDefinition.paused],
    [labels['on-hold'], statusDefinition['on-hold']],
    [labels.completed, statusDefinition.completed],
    [labels.incompleted, statusDefinition.incompleted],
  ];
};
