import { useCallback, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { GridItem, cssVariables, Headings, Icon, Spinner } from 'feather';
import sortBy from 'lodash/sortBy';
import numbro from 'numbro';

import { StatisticsMetrics, StatisticsMetricsLegacy } from '@constants';
import { LineChart } from '@ui/components/chart';

import { AnalyticsOverviewLastUpdatedAtContext } from './AnalyticsOverviewLastUpdatedAtContext';
import { useAdvancedAnalytics } from './useAdvancedAnalytics';
import { useAnalyticsIntl } from './useAnalyticsIntl';

const ChartSeries = styled.div`
  font-size: 16px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: -0.25px;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ChartValue = styled.div`
  ${Headings['heading-06']}
  color: ${cssVariables('purple-7')};
`;

const ViewDetail = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2px;
  margin-left: 8px;
  &:hover {
    cursor: pointer;
  }
`;

const ChartWrapper = styled.div`
  margin-top: 10px;
  & > div {
    margin: 0 -20px;
  }
`;

const SpinnerWrapper = styled.div`
  width: 100%;
  height: 332px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.4);
`;

export const OverviewStatisticsItem = ({ dateRange, metricType }) => {
  const history = useHistory();
  const appId = useSelector((state: RootState) => state.applicationState.data?.app_id);
  const { isLoading, data, fetchedAt } = useAdvancedAnalytics({
    metricType,
    timeDimension: 'daily',
    dateRange,
  });
  const { getMetricMessages } = useAnalyticsIntl();
  const intlMap = getMetricMessages(metricType);

  const updateLastUpdatedAt = useContext(AnalyticsOverviewLastUpdatedAtContext);

  useEffect(() => {
    updateLastUpdatedAt(fetchedAt);
  }, [fetchedAt, updateLastUpdatedAt]);

  const handleClickDetail = useCallback(() => {
    history.push(`/${appId}/analytics/${metricType}`);
  }, [appId, history, metricType]);

  return (
    <GridItem colSpan={4} key="chartItem_testing">
      {isLoading ? (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      ) : (
        <>
          <ChartSeries onClick={handleClickDetail}>
            {intlMap?.header}
            <ViewDetail>
              <Icon icon="chevron-right" size={20} />
            </ViewDetail>
          </ChartSeries>
          <ChartValue>
            {numbro(
              metricType === StatisticsMetrics.messages_per_user ||
                metricType === StatisticsMetricsLegacy.channel_member
                ? data.average
                : data.total,
            ).format({ thousandSeparated: true, mantissa: 0 })}
          </ChartValue>
          <ChartWrapper>
            <LineChart
              key={intlMap?.header}
              height="200px"
              datasets={[
                {
                  label: intlMap?.header,
                  data: sortBy(data.statistics, 'x'),
                },
              ]}
              useArea={true}
            />
          </ChartWrapper>
        </>
      )}
    </GridItem>
  );
};
