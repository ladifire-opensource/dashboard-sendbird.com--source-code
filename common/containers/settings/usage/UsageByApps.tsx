import { useEffect, FC, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { Table, TableColumnProps } from 'feather';
import moment, { Moment } from 'moment-timezone';
import numbro from 'numbro';
import qs from 'qs';

import { fetchMonthlyUsageByApplications } from '@common/api';
import { useAsync } from '@hooks';
import { getField, getTransformedUsage, isByteUsageFeature, transformBytesToGigaByte } from '@utils';

type UsageByAppsRecord = {
  app_name: string;
  usage: number;
  share: number;
};

const useUsageByApps = (payload: { usageField?: string; date: Moment }) => {
  const { usageField, date } = payload;
  const organization = useSelector((state: RootState) => state.organizations.current);

  const [{ status, data: response }, load] = useAsync<{
    data: {
      data: UsageByApps[];
    };
  }>(async () => {
    const params = qs.stringify({
      target_month: date.format('YYYY-MM'),
      field: getField(usageField),
    });
    return fetchMonthlyUsageByApplications(organization.uid, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const usageData = response?.data.data;
  // Last updated at is the latest update_dt in the data.
  const lastUpdatedAt = useMemo(() => {
    return usageData
      ? usageData.reduce((result: number | null, cur) => {
          if (!cur.updated_dt) {
            return result;
          }
          const timestamp = moment(cur.updated_dt).valueOf();
          return typeof result === 'number' ? Math.max(result, timestamp) : timestamp;
        }, null)
      : null;
  }, [usageData]);

  return {
    isLoading: status === 'loading',
    usage: usageData ?? [],
    lastUpdatedAt,
  };
};

type Props = {
  date: Moment;
  usageField: FeatureUsageField;
};

export const UsageByApps: FC<Props> = ({ date, usageField }) => {
  const intl = useIntl();

  const { isLoading, usage } = useUsageByApps({
    usageField,
    date,
  });

  const columns: TableColumnProps<UsageByAppsRecord>[] = [
    {
      title: intl.formatMessage({ id: 'common.settings.usage.usageByApps.column.applicationName' }),
      dataIndex: 'app_name',
    },
    {
      title: intl.formatMessage({ id: 'common.settings.usage.usageByApps.column.usage' }),
      dataIndex: 'usage',
      width: 180,
      render: ({ usage }) => {
        if (usage) {
          if (isByteUsageFeature(usageField)) {
            return getTransformedUsage(transformBytesToGigaByte(Number(usage)));
          }
          return getTransformedUsage(Number(usage));
        }
        return 0;
      },
    },
    {
      title: intl.formatMessage({ id: 'common.settings.usage.usageByApps.column.share' }),
      dataIndex: 'share',
      width: 120,
      render: ({ share }) => {
        return `${numbro(share).format('0.00')}%`;
      },
    },
  ];
  const dataSource = usage.map(({ app_name, usage, share }) => {
    return {
      // inUse: true,
      app_name,
      usage,
      share,
    };
  });

  return (
    <Table<UsageByAppsRecord>
      columns={columns}
      dataSource={dataSource}
      loading={isLoading}
      css={`
        margin-top: -8px;
      `}
    />
  );
};
