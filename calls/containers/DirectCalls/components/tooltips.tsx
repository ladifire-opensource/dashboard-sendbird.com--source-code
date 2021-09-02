import { FC } from 'react';
import { useIntl } from 'react-intl';

import { css, SimpleInterpolation } from 'styled-components';

import { Body, Tooltip, TooltipProps, TooltipTargetIcon, TooltipVariant } from 'feather';

import { EndResultTable } from './endResultTable';

type InfoIconWithTooltipProps = Omit<TooltipProps, 'children'> & { style?: SimpleInterpolation };
type ContentTooltipProps = Omit<InfoIconWithTooltipProps, 'content'>;

export const InfoIconWithTooltip: FC<InfoIconWithTooltipProps> = ({ style, ...props }) => {
  return (
    <Tooltip
      variant={TooltipVariant.Light}
      tooltipContentStyle={css`
        ${Body['body-short-01']}
        max-width: 256px;
        padding: 16px 20px;
        cursor: default;
        ${style}
      `}
      {...props}
    >
      <TooltipTargetIcon icon="info" />
    </Tooltip>
  );
};

export const EndResultTooltip: FC<ContentTooltipProps> = (props) => {
  return <InfoIconWithTooltip content={<EndResultTable />} style="max-width: none" {...props} />;
};

export const CallerTooltip: FC<ContentTooltipProps> = (props) => {
  const intl = useIntl();
  return (
    <InfoIconWithTooltip
      content={intl.formatMessage({ id: 'calls.callLogs.table.header_label.callerTooltip' })}
      {...props}
    />
  );
};

export const CalleeTooltip: FC<ContentTooltipProps> = (props) => {
  const intl = useIntl();
  return (
    <InfoIconWithTooltip
      content={intl.formatMessage({ id: 'calls.callLogs.table.header_label.calleeTooltip' })}
      {...props}
    />
  );
};

export const AverageMOSTooltip: FC<ContentTooltipProps> = (props) => {
  const intl = useIntl();
  return (
    <InfoIconWithTooltip
      content={intl.formatMessage({ id: 'calls.callLogsDetail.callInformation_label.mos.tooltip' })}
      {...props}
    />
  );
};
