import moment from 'moment-timezone';

/**
 * Original data export statuses are different from the statuses on dashboard UI. When a data export file is expired,
 * the original status will remain as "done" or "job_completed", but the dashboard will show "Expired" status. "no data"
 * status, which indicates there's no corresponding data to export, will be shown as "Completed" on the dashboard.
 */
export enum DataExportUIStatus {
  Scheduled = 'scheduled',
  Exporting = 'exporting',
  Merging = 'merging',
  Completed = 'completed',
  Failed = 'failed',
  Expired = 'expired',
  Cancelled = 'cancelled',
}

const statusMap: Record<DataExport['status'], DataExportUIStatus> = {
  scheduled: DataExportUIStatus.Scheduled,
  exporting: DataExportUIStatus.Exporting,
  done: DataExportUIStatus.Completed,
  failed: DataExportUIStatus.Failed,
  'no data': DataExportUIStatus.Completed,
  'size exceeded': DataExportUIStatus.Failed,
  cancelled: DataExportUIStatus.Cancelled,
  job_scheduled: DataExportUIStatus.Scheduled,
  job_export_in_progress: DataExportUIStatus.Exporting,
  job_merge_in_progress: DataExportUIStatus.Merging,
  job_completed: DataExportUIStatus.Completed,
  job_failed: DataExportUIStatus.Failed,
};

export const mapDataExportStatus = (
  originalStatus: DataExport['status'],
  file: DataExport['file'],
): DataExportUIStatus | undefined => {
  if (file) {
    const currentTimestamp = moment().unix() * 1000;
    if (file.expires_at < currentTimestamp) {
      return DataExportUIStatus.Expired;
    }
  }
  return statusMap[originalStatus];
};
