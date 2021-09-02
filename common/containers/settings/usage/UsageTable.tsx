import { useMemo, useContext, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useRouteMatch, useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import isValid from 'date-fns/fp/isValid';
import isBefore from 'date-fns/isBefore';
import {
  cssVariables,
  Table,
  TableColumnProps,
  Lozenge,
  LozengeVariant,
  Link,
  LinkVariant,
  PrimitiveColor,
  ContextualHelp,
  TooltipTargetIcon,
} from 'feather';
import partition from 'lodash/partition';
import moment, { Moment } from 'moment-timezone';
import qs from 'qs';

import { useFeatureName } from '@common/hooks';
import { ChatFeatureList, FeatureTypeLozengeColors, FeatureType } from '@constants';
import { useQueryString } from '@hooks/useQueryString';
import { MonthSinglePicker } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { generateUsageData } from '@utils';

import { UsageColumnUsage } from './UsageColumnUsage';
import { UsageContext } from './UsageContext';

const StyledUsageTable = styled.div`
  margin-top: 24px;
`;

const FeatureNameLink = styled(Link)<{ color?: PrimitiveColor }>`
  ${({ color }) =>
    color
      ? css`
          color: ${cssVariables([color, 5])};
          &:hover {
            color: ${cssVariables([color, 6])};
          }
        `
      : ''};
`;

const UsageTableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ColumnWithChildren = styled.div`
  display: flex;
  align-items: center;
`;

const ColumnTitle = styled.div`
  margin-left: 12px;
`;

const renderType = ({ type }: ChatFeature) => {
  return (
    <Lozenge variant={LozengeVariant.Light} color={FeatureTypeLozengeColors[type]}>
      {type}
    </Lozenge>
  );
};

type SearchParams = {
  date: string | null;
};

const defaultParams: SearchParams = {
  date: null,
};

const MONTH_SELF_SERVICE_STARTED = '2020-04';
const DATE_SELF_SERVICE_STARTED = `${MONTH_SELF_SERVICE_STARTED}-01`; // 2020-04-01

export const UsageTable = () => {
  const intl = useIntl();
  const match = useRouteMatch();
  const history = useHistory();
  const getFeatureName = useFeatureName();

  const { date, setDate, subscription, isLoadingSubscription, isLoadingUsage, monthlyUsage } = useContext(UsageContext);
  const { date: queryDate, updateParams } = useQueryString(defaultParams, {
    date: (queryDate) =>
      typeof queryDate === 'string' &&
      isValid(new Date(queryDate)) &&
      !isBefore(new Date(queryDate), new Date(MONTH_SELF_SERVICE_STARTED)),
  });

  useEffect(() => {
    if (typeof queryDate === 'string') {
      setDate(moment(queryDate));
    }
  }, [queryDate, setDate]);

  const handleDateChange = (newDate: Moment) => {
    updateParams({ date: newDate.format('YYYY-MM') });
  };

  const handleFeatureClick = useCallback(
    (featureKey) => () => {
      const params = qs.stringify({ date: date.format('YYYY-MM') });
      history.push(`${match?.url}/${featureKey}?${params}`);
    },
    [history, match?.url, date],
  );

  const transformedFeatures = useMemo(() => {
    if (subscription) {
      const dataSourceBeforeSort = ChatFeatureList.map((feature) => {
        const usageData = feature.plans.map(({ planKey, usageField }) => {
          const monthlyUsageValue = monthlyUsage?.[usageField] ?? 0;
          const plan = subscription.plan[planKey] ?? null;
          return generateUsageData({
            feature,
            plan,
            usage: monthlyUsageValue,
            usageField,
          });
        });
        const plans = usageData.map((item) => item.plan).filter((plan) => !!plan);
        const isUnavailable = usageData.some(({ isExceedLimit }) => isExceedLimit);
        return {
          usageData,
          feature,
          isEnabled: feature.type === FeatureType.Core || plans.every((plan) => !!plan?.enabled),
          name: getFeatureName({ featureKey: feature.key, billingPlanItem: plans.length > 0 ? plans[0] : undefined }),
          isUnavailable,
        };
      });

      // reorder the list so
      // disabled features come after the enabled features.
      // in the enabled features, untrackable features come after the trackable features.
      const [enabledFeatures, disabledFeatures] = partition(dataSourceBeforeSort, (item) => item.isEnabled);
      const [trackableFeatures, untrackableFeatures] = partition(enabledFeatures, (item) => item.feature.trackable);
      return [...trackableFeatures, ...untrackableFeatures, ...disabledFeatures];
    }
    return [];
  }, [getFeatureName, monthlyUsage, subscription]);

  type TableRecord = typeof transformedFeatures[number];

  const columns: TableColumnProps<TableRecord>[] = useMemo(
    () => [
      {
        title: intl.formatMessage({ id: 'common.settings.usage.column.type' }),
        key: 'type',
        dataIndex: 'type',
        width: '84px',
        render: (record) => renderType(record.feature),
      },
      {
        title: intl.formatMessage({ id: 'common.settings.usage.column.feature' }),
        key: 'feature',
        dataIndex: 'key',
        render: ({ isUnavailable, name }) => (
          <>
            <FeatureNameLink variant={LinkVariant.Neutral} color={isUnavailable ? 'red' : undefined}>
              {name}
            </FeatureNameLink>
            {isUnavailable ? (
              <Lozenge variant={LozengeVariant.Dark} color="red" css="margin-left: 16px;">
                {intl.formatMessage({ id: 'common.settings.usage.column.isActive.unavailable' })}
              </Lozenge>
            ) : null}
          </>
        ),
        onCell: (record) => ({
          style: {
            cursor: 'pointer',
          },
          onClick: handleFeatureClick(record.feature.key),
        }),
        styles: css`
          &:hover {
            a {
              text-decoration: underline;
            }
          }
        `,
      },
      {
        title: (
          <ColumnWithChildren>
            <ColumnTitle>{intl.formatMessage({ id: 'common.settings.usage.column.quota' })}</ColumnTitle>
            <ContextualHelp
              content={intl.formatMessage({ id: 'common.settings.usage.column.quota.tooltip' })}
              tooltipContentStyle={css`
                font-weight: 400;
              `}
            >
              <TooltipTargetIcon icon="info" />
            </ContextualHelp>
          </ColumnWithChildren>
        ),
        key: 'quota',
        dataIndex: 'trackable',
        width: '440px',
        render: (record) => {
          return <UsageColumnUsage record={record} subscription={subscription} />;
        },
      },
    ],
    [handleFeatureClick, intl, subscription],
  );

  const isBeforeSelfService = date.isBefore(moment(DATE_SELF_SERVICE_STARTED), 'month');
  const isAfterThisMonth = date.isAfter(moment(), 'month');

  const renderUsage = useMemo(() => {
    if (isAfterThisMonth) {
      return (
        <CenteredEmptyState
          icon="usage"
          title={intl.formatMessage({ id: 'common.settings.usage.usageTable.unavailable.title.future' })}
          description={intl.formatMessage({ id: 'common.settings.usage.usageTable.unavailable.description.future' })}
        />
      );
    }

    if (isBeforeSelfService) {
      return (
        <CenteredEmptyState
          icon="usage"
          title={intl.formatMessage({ id: 'common.settings.usage.usageTable.unavailable.title.past' })}
          description={intl.formatMessage({ id: 'common.settings.usage.usageTable.unavailable.description.past' })}
        />
      );
    }

    return (
      <Table<TableRecord>
        columns={columns}
        dataSource={transformedFeatures}
        rowStyles={() => css`
          &:hover {
            a {
              color: ${cssVariables('purple-7')};
            }
          }
        `}
        loading={isLoadingUsage || isLoadingSubscription}
      />
    );
  }, [
    columns,
    intl,
    isAfterThisMonth,
    isBeforeSelfService,
    isLoadingSubscription,
    isLoadingUsage,
    transformedFeatures,
  ]);

  return (
    <StyledUsageTable>
      <UsageTableHeader>
        <MonthSinglePicker value={date} onChange={handleDateChange} />
      </UsageTableHeader>
      {renderUsage}
    </StyledUsageTable>
  );
};
