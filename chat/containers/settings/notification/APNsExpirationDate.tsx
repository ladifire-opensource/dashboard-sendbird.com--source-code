import { FC, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, TooltipTargetIcon, Tooltip, TooltipVariant, Icon } from 'feather';
import moment from 'moment-timezone';

import { DEFAULT_DATE_FORMAT, FULL_MONTH_DATE_FORMAT } from '@constants';

type Props = { timestamp: number; color?: string };

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

const Container = styled.time<{ $color: string; $bold?: boolean }>`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  min-width: 0;
  color: ${({ $color }) => $color};
  font-weight: ${({ $bold }) => ($bold ? 500 : 400)};
`;

const Red = styled.b`
  color: ${cssVariables('red-5')};
  font-weight: 600;
`;

const Bold = styled.b`
  font-weight: 600;
`;

const MoreIconButton: FC<{ label: string }> = ({ label }) => (
  <div
    css={`
      // center the children
      display: inline-flex;
      align-items: center;
      justify-content: center;

      // align the top with the top of the entire line
      vertical-align: top;

      // same as the line height
      height: 20px;
    `}
  >
    <Icon
      assistiveText={label}
      icon="more"
      size={16}
      color={cssVariables('neutral-9')}
      css={`
        flex: none; // avoid being shrinked
        border-radius: 4px;
        background: ${cssVariables('neutral-2')};
        padding: 3px;
        width: 22px;
        height: 22px;
      `}
    />
  </div>
);

const TooltipIcon = styled(TooltipTargetIcon).attrs({
  color: 'currentColor',
  size: 16,
  role: 'button',
})`
  margin-left: 3px;
`;

export const APNsExpirationDate: FC<Props> = ({ timestamp, color: overriddenColor }) => {
  const intl = useIntl();
  const momentObj = useMemo(() => moment(timestamp), [timestamp]);
  const formattedDate = momentObj.format(DEFAULT_DATE_FORMAT);
  const isoString = momentObj.toISOString();

  const daysToExpiration = Math.ceil((timestamp - Date.now()) / MILLISECONDS_IN_A_DAY);

  if (daysToExpiration <= 0) {
    // Expired
    return (
      <Container $color={overriddenColor || cssVariables('red-5')} $bold={true} dateTime={isoString}>
        {intl.formatMessage({ id: 'core.settings.application.notification.apns.expirationDate.expired' })}
        <Tooltip
          variant={TooltipVariant.Light}
          content={intl.formatMessage(
            { id: 'core.settings.application.notification.apns.expirationDate.expired.tooltip' },
            {
              date: momentObj.format(FULL_MONTH_DATE_FORMAT),
              red: (text) => <Red>{text}</Red>,
              b: (text) => <Bold>{text}</Bold>,
              icon: ([text]) => <MoreIconButton label={text} />,
            },
          )}
          tooltipContentStyle="max-width: 256px;"
        >
          <TooltipIcon icon="error-filled" />
        </Tooltip>
      </Container>
    );
  }

  if (daysToExpiration <= 30) {
    // Warning
    return (
      <Container $color={overriddenColor || cssVariables('yellow-5')} $bold={true} dateTime={isoString}>
        {formattedDate}
        <Tooltip
          variant={TooltipVariant.Light}
          content={intl.formatMessage(
            { id: 'core.settings.application.notification.apns.expirationDate.warning.tooltip' },
            {
              days: daysToExpiration,
              red: (text) => <Red>{text}</Red>,
              b: (text) => <Bold>{text}</Bold>,
              icon: ([text]) => <MoreIconButton label={text} />,
            },
          )}
          tooltipContentStyle="max-width: 256px;"
        >
          <TooltipIcon icon="warning-filled" />
        </Tooltip>
      </Container>
    );
  }

  return (
    <Container $color={overriddenColor || cssVariables('neutral-10')} dateTime={isoString}>
      {formattedDate}
    </Container>
  );
};
