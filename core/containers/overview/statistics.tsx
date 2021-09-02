import React from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';

import { coreActions } from '@actions';
import { checkHourlyPeakYonggan } from '@authorization';
import {
  refinedDAU,
  refinedHourlyCCU,
  refinedMAU,
  refinedMessages,
  refinedDailyConnections,
  refinedMonthlyConnections,
} from '@selectors';
import { Card } from '@ui/components';

import { StatisticsMonthly, StatisticsDaily, StatisticsHourlyConnections } from './statisticsDetail';

const StyledStatistics = styled(Card)`
  padding: 24px;
`;

const mapStateToProps = (state: RootState) => {
  return {
    checkYonggan: checkHourlyPeakYonggan(state.organizations),
    dau: refinedDAU(state.overview.statistics.dau),
    mau: refinedMAU(state.overview.statistics.mau),
    messages: refinedMessages(state.overview.statistics.messages),
    connections: refinedDailyConnections(state.overview.statistics.connections),
    hourlyCCU: refinedHourlyCCU(state.overview.statistics.hourlyCCU, state.overview.selectedHourlyDate),
    monthlyConnection: refinedMonthlyConnections(state.overview.statistics.monthlyConnection),
  };
};

const mapDispatchToProps = {
  fetchMAURequest: coreActions.fetchMAURequest,
  fetchDAURequest: coreActions.fetchDAURequest,
  fetchMessagesCountRequest: coreActions.fetchMessagesCountRequest,
  fetchDailyCCURequest: coreActions.fetchDailyCCURequest,
  fetchMonthlyCCURequest: coreActions.fetchMonthlyCCURequest,
  fetchHourlyCCURequest: coreActions.fetchHourlyCCURequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps;

const StatisticsConnectable: React.FC<Props> = ({
  checkYonggan,
  dau,
  mau,
  messages,
  connections,
  hourlyCCU,
  monthlyConnection,

  fetchMAURequest,
  fetchDAURequest,
  fetchMessagesCountRequest,
  fetchDailyCCURequest,
  fetchMonthlyCCURequest,
  fetchHourlyCCURequest,
}) => {
  return (
    <StyledStatistics>
      <StatisticsMonthly
        statistics={{ mau, monthlyConnection }}
        fetchMAURequest={fetchMAURequest}
        fetchMonthlyCCURequest={fetchMonthlyCCURequest}
      />
      <StatisticsDaily
        statistics={{ dau, messages, connections }}
        fetchDAURequest={fetchDAURequest}
        fetchMessagesCountRequest={fetchMessagesCountRequest}
        fetchDailyCCURequest={fetchDailyCCURequest}
      />
      {checkYonggan && (
        <StatisticsHourlyConnections statistics={hourlyCCU} fetchHourlyCCURequest={fetchHourlyCCURequest} />
      )}
    </StyledStatistics>
  );
};

export const Statistics = connect(mapStateToProps, mapDispatchToProps)(StatisticsConnectable);
