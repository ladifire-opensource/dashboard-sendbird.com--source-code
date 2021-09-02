import { useIntl } from 'react-intl';

/**
 * Returns a string only if the given error must be shown in an error dialog.
 *
 * @param error Error response body
 * @param intl Return value of useIntl
 */
export const getAnnouncementErrorMessage = (error: unknown, intl: ReturnType<typeof useIntl>) => {
  const code = Number((error as any)?.data?.code ?? -1);
  const message = String((error as any)?.data?.message ?? '');

  if (code === 400111 && message.includes('scheduled_at must not be before current time')) {
    return intl.formatMessage({ id: 'chat.announcements.scheduleErrors.pastScheduledAt' });
  }

  if (code === 400920 && message.includes("Announcement status should be 'scheduled' to be edited.")) {
    return intl.formatMessage({ id: 'chat.announcements.editAnnouncement.cannotSaveChangesDialog.alreadyStarted' });
  }

  if (
    code === 400111 &&
    [
      'Out of time range. cease_at can’t be earlier than scheduled_at if announcement schedule is within 1 day.',
      "schedule has to be resumed at least once between 'resume_at' and 'end_at'",
    ].some((v) => message.includes(v))
  ) {
    return intl.formatMessage({ id: 'chat.announcements.scheduleErrors.doNotDisturbDuringRunningHours' });
  }

  return undefined;
};
