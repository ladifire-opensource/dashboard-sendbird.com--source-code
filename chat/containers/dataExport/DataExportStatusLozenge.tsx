import { FC } from 'react';
import { useIntl } from 'react-intl';

import { css } from 'styled-components';

import { Lozenge, Tooltip, TooltipVariant, Body } from 'feather';

import { PropOf } from '@utils';

import { mapDataExportStatus, DataExportUIStatus } from './mapDataExportStatus';
import { useStatusDefinition } from './useStatusDefinition';

type Props = Pick<DataExport, 'file' | 'status'>;
type LozengeColor = PropOf<typeof Lozenge, 'color'>;

const fallbackStatusColor: LozengeColor = 'purple';

const statusMap: Record<DataExportUIStatus, { color: LozengeColor; intlMessageId: string }> = {
  [DataExportUIStatus.Scheduled]: {
    color: 'blue',
    intlMessageId: 'chat.dataExport.status.scheduled',
  },
  [DataExportUIStatus.Exporting]: {
    color: 'purple',
    intlMessageId: 'chat.dataExport.status.exporting',
  },
  [DataExportUIStatus.Completed]: {
    color: 'green',
    intlMessageId: 'chat.dataExport.status.completed',
  },
  [DataExportUIStatus.Failed]: {
    color: 'red',
    intlMessageId: 'chat.dataExport.status.failed',
  },
  [DataExportUIStatus.Expired]: {
    color: 'neutral',
    intlMessageId: 'chat.dataExport.status.expired',
  },
  [DataExportUIStatus.Cancelled]: {
    color: 'neutral',
    intlMessageId: 'chat.dataExport.status.cancelled',
  },
  [DataExportUIStatus.Merging]: {
    color: 'purple',
    intlMessageId: 'chat.dataExport.status.merging',
  },
};

export const DataExportStatusLozenge: FC<Props> = ({ file, status }) => {
  const intl = useIntl();
  const uiStatus = mapDataExportStatus(status, file);
  const definitions = useStatusDefinition();

  if (uiStatus && statusMap[uiStatus] && definitions[uiStatus]) {
    const { color, intlMessageId } = statusMap[uiStatus];
    const { definition } = definitions[uiStatus];

    return (
      <Tooltip
        variant={TooltipVariant.Light}
        content={definition}
        tooltipContentStyle={css`
          max-width: 256px;
          ${Body['body-short-01']};
        `}
        placement="bottom-end"
      >
        <Lozenge color={color}>{intl.formatMessage({ id: intlMessageId })}</Lozenge>
      </Tooltip>
    );
  }

  if ((status as unknown) === 7) {
    // FIXME: this block can be removed after updating status_choice from soda https://sendbird.atlassian.net/browse/ISSUE-3734?focusedCommentId=85259
    return <Lozenge color={statusMap.cancelled.color}>{statusMap.cancelled.intlMessageId}</Lozenge>;
  }

  return <Lozenge color={fallbackStatusColor}>{typeof status === 'string' ? status : 'Unknown'}</Lozenge>;
};
