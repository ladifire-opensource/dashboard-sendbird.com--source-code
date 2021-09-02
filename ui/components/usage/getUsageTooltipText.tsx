import { IntlShape } from 'react-intl';

import { Link, LinkVariant } from 'feather';
import numbro from 'numbro';

import { USAGE_GB_UNIT } from '@constants';
import { transformBytesToGigaByte } from '@utils';

const formatNumber = (value: any) => numbro(value).format({ thousandSeparated: true, mantissa: 0 });

type Props = {
  intl: IntlShape;
  isFreeTrial: boolean;
  /**
   * Raw usage amount value. Bytes for File storage/File upload traffic usage
   */
  limit: number;
  /**
   * If unit='gigabyte', limit value is converted into gigabytes and appended with GB unit.
   */
  unit?: 'gigabyte' | '';
  onLinkClick: () => any;
};

export const getUsageTooltipText = ({ intl, isFreeTrial, limit, onLinkClick, unit }: Props) => {
  if (isFreeTrial) {
    return {
      warning: "You've almost reached your quota.", // fallback message it should not shown
      over: "You've exceeded your quota.", // fallback message it should not shown
      willStop: intl.formatMessage({ id: 'common.usage.alerts.free.quota80' }),
      stopped: intl.formatMessage({ id: 'common.usage.alerts.free.quota100' }),
    };
  }
  const formattedLimit =
    unit === 'gigabyte' ? formatNumber(transformBytesToGigaByte(limit)) + USAGE_GB_UNIT : formatNumber(limit);
  const linkComponent = (text: string) => (
    <Link variant={LinkVariant.Default} iconProps={{ icon: 'chevron-right', size: 16 }} onClick={onLinkClick}>
      {text}
    </Link>
  );
  return {
    warning: intl.formatMessage(
      { id: 'common.usage.alerts.warning' },
      {
        a: linkComponent,
      },
    ),
    over: intl.formatMessage(
      { id: 'common.usage.alerts.over' },
      {
        limit: formattedLimit,
        a: linkComponent,
      },
    ),
    willStop: intl.formatMessage(
      { id: 'common.usage.alerts.willStop' },
      {
        limit: formattedLimit,
        a: linkComponent,
      },
    ),
    stopped: intl.formatMessage(
      { id: 'common.usage.alerts.stopped' },
      {
        limit: formattedLimit,
      },
    ),
  };
};
