import { FC } from 'react';

import { css } from 'styled-components';

import { Lozenge, Tooltip, TooltipProps, TooltipVariant } from 'feather';

import { PropOf } from '@utils';

import { useAnnouncementVersion } from './useAnnouncementVersion';
import { useStatusDefinition } from './useStatusDefinition';

type Props = {
  status: AnnouncementV10['status'] | AnnouncementV15['status'] | AnnouncementV16['status'];
  disableTooltip?: boolean;
  tooltipPlacement?: TooltipProps['placement'];
};

type LozengeColor = PropOf<typeof Lozenge, 'color'>;

export const colorMapV10: Record<AnnouncementV10['status'], LozengeColor> = {
  scheduled: 'blue',
  running: 'purple',
  canceled: 'neutral',
  aborted: 'neutral',
  done: 'green',
};

export const colorMapV15: Record<AnnouncementV15['status'], LozengeColor> = {
  scheduled: 'blue',
  removed: 'neutral',
  running: 'purple',
  canceled: 'neutral',
  paused: 'orange',
  completed: 'green',
  incompleted: 'green',
};

export const colorMapV16: Record<AnnouncementV16['status'], LozengeColor> = {
  running: 'purple',
  scheduled: 'blue',
  paused: 'orange',
  'on-hold': 'orange',
  completed: 'green',
  incompleted: 'green',
  canceled: 'neutral',
  stopped: 'neutral',
};
export const AnnouncementStatusLozenge: FC<Props> = ({ status, tooltipPlacement = 'bottom', disableTooltip }) => {
  const announcementVersion = useAnnouncementVersion();
  const statusDefinition = useStatusDefinition();

  const color =
    (announcementVersion === 'v1.0' && colorMapV10[status]) ||
    (announcementVersion === 'v1.5' && colorMapV15[status]) ||
    (announcementVersion === 'v1.6' && colorMapV16[status]) ||
    'neutral'; // as fallback color

  const lozenge = <Lozenge color={color}>{status}</Lozenge>;

  return (
    // prevent tooltip from being hidden using portalId prop
    <Tooltip
      variant={TooltipVariant.Light}
      disabled={disableTooltip}
      content={statusDefinition[status]}
      placement={tooltipPlacement}
      portalId="portal_popup"
      tooltipContentStyle={css`
        width: 256px;

        b {
          font-weight: 600;
        }
      `}
      children={lozenge}
    />
  );
};
