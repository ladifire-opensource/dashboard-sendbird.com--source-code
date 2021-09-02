import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { DataExportUIStatus } from './mapDataExportStatus';

const intlMap: Record<DataExportUIStatus, { term: string; definition: string; longDefinition: string }> = {
  [DataExportUIStatus.Scheduled]: {
    term: 'chat.dataExport.status.scheduled',
    definition: 'chat.dataExport.status.scheduled.definition',
    longDefinition: 'chat.dataExport.status.scheduled.definition.long',
  },
  [DataExportUIStatus.Exporting]: {
    term: 'chat.dataExport.status.exporting',
    definition: 'chat.dataExport.status.exporting.definition',
    longDefinition: 'chat.dataExport.status.exporting.definition.long',
  },
  [DataExportUIStatus.Merging]: {
    term: 'chat.dataExport.status.merging',
    definition: 'chat.dataExport.status.merging.definition',
    longDefinition: 'chat.dataExport.status.merging.definition.long',
  },
  [DataExportUIStatus.Completed]: {
    term: 'chat.dataExport.status.completed',
    definition: 'chat.dataExport.status.completed.definition',
    longDefinition: 'chat.dataExport.status.completed.definition.long',
  },
  [DataExportUIStatus.Failed]: {
    term: 'chat.dataExport.status.failed',
    definition: 'chat.dataExport.status.failed.definition',
    longDefinition: 'chat.dataExport.status.failed.definition.long',
  },
  [DataExportUIStatus.Expired]: {
    term: 'chat.dataExport.status.expired',
    definition: 'chat.dataExport.status.expired.definition',
    longDefinition: 'chat.dataExport.status.expired.definition.long',
  },
  [DataExportUIStatus.Cancelled]: {
    term: 'chat.dataExport.status.cancelled',
    definition: 'chat.dataExport.status.cancelled.definition',
    longDefinition: 'chat.dataExport.status.cancelled.definition.long',
  },
};

export const useStatusDefinition = () => {
  const intl = useIntl();

  const definitions = useMemo(
    () =>
      Object.entries(intlMap).reduce((result, [status, intlKeys]) => {
        result[status] = Object.entries(intlKeys).reduce((messages, [key, intlKey]) => {
          messages[key] = intl.formatMessage({ id: intlKey });
          return messages;
        }, {});
        return result;
      }, {} as typeof intlMap),
    [intl],
  );

  return definitions;
};
