import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { useAnnouncementVersion } from './useAnnouncementVersion';

export const useFieldNames = () => {
  const intl = useIntl();
  const version = useAnnouncementVersion() || '';

  //  We don't need to keep intl text for legacy versions because they will be deprecated.
  return useMemo(
    () => ({
      announcementGroup: {
        'v1.0': 'Group Name',
        'v1.5': 'Custom type',
        'v1.6': intl.formatMessage({ id: 'chat.announcements.detail.info.announcementGroup.label' }),
      }[version],
      completedAt: {
        'v1.0': 'Done on',
        'v1.5': intl.formatMessage({ id: 'chat.announcements.detail.info.completedAt.label' }),
        'v1.6': intl.formatMessage({ id: 'chat.announcements.detail.info.completedAt.label' }),
      }[version],
    }),
    [intl, version],
  );
};
